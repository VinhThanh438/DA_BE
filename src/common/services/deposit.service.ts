import { Deposits, Prisma } from '.prisma/client';
import { BaseService } from './base.service';
import { DepositRepo } from '@common/repositories/deposit.repo';
import {
    IDepositApprove,
    IDepositCreate,
    IDepositSettlement,
    IDepositUpdate,
} from '@common/interfaces/deposit.interface';
import { BankRepo } from '@common/repositories/bank.repo';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import moment from 'moment-timezone';
import { APIError } from '@common/error/api.error';
import { PaymentRequestStatus, PaymentRequestType, TransactionOrderType, TransactionType } from '@config/app.constant';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { ITransaction } from '@common/interfaces/transaction.interface';
import { CommonService } from './common.service';
import { IPayment } from '@common/interfaces/payment.interface';
import { PaymentRepo } from '@common/repositories/payment.repo';

export class DepositService extends BaseService<
    Deposits,
    Prisma.DepositsSelect,
    Prisma.DepositsWhereInput,
    DepositRepo
> {
    private static instance: DepositService;
    private static CommonServiceInstance: CommonService;
    private bankRepo: BankRepo = new BankRepo();
    private paymentRepo: PaymentRepo = new PaymentRepo();
    private organizationRepo: OrganizationRepo = new OrganizationRepo();
    private transactionRepo: TransactionRepo = new TransactionRepo();

    private constructor() {
        super(new DepositRepo());
    }

    public static getInstance(): DepositService {
        if (!this.instance) {
            this.instance = new DepositService();
        }
        return this.instance;
    }

    /**
     * Tạo một khoản tiền gửi mới, bao gồm việc xác thực các khóa ngoại , service này sẽ được gọi khi co giao dịch chuyển tiền vào 1 tài khoản tiền gửi.
     * @param request - The deposit creation request containing bank_id, organization_id, and other fields
     * @param tx - Optional transaction client for database operations
     * @returns The ID of the created deposit
     * @throws APIError if foreign keys are invalid or required fields are missing
     */
    public async createDeposit(
        request: IDepositCreate,
        userId: number,
        employeeId: number,
        tx?: Prisma.TransactionClient,
    ): Promise<IIdResponse> {
        console.log(request);
        // Validate required fields
        await this.validateForeignKeys(
            request,
            {
                bank_id: this.bankRepo,
                organization_id: this.organizationRepo,
            },
            tx,
        );

        await this.isExist({ account_number: request.account_number });

        const bank = await this.bankRepo.findOne({ id: request.bank_id });
        if (!bank) {
            throw new APIError({ message: 'bank_id.not_found', status: 400, errors: ['bank_id.not_found'] });
        }

        if (request.amount > Number(bank.balance)) {
            throw new APIError({
                message: 'amount.invalid',
                status: 400,
                errors: ['amount.invalid'],
            });
        }

        const withdraw_date = moment(request.deposit_date).add(request.term, 'months').toISOString();
        const compound_interest =
            Number(request.amount) *
            Math.pow(1 + (request.interest_rate as number) / 100, (request.term as number) / 12);

        const dataCreate: IDepositCreate = {
            ...request,
            withdraw_date,
            compound_interest,
            employee_id: employeeId,
            created_by: userId,
            time_at: moment().toISOString(),
        };

        // Create the deposit record
        const depositId = await this.repo.create(dataCreate, tx);

        if (depositId) {
            // Trừ số dư khả dụng trong tài khoản ngân hàng
            await this.bankRepo.update(
                { id: request.bank_id },
                { balance: Number(bank.balance) - Number(request.amount) },
                tx,
            );

            // Create payment transaction
            const paymentData: IPayment = {
                code: '',
                status: PaymentRequestStatus.CONFIRMED,
                type: PaymentRequestType.INTEREST,
                time_at: moment(request.time_at).toDate(),
                payment_date: moment(request.deposit_date).toDate(),
                bank_id: request.bank_id,
                organization_id: request.organization_id,
            };

            await this.paymentRepo.create(paymentData);

            const transactionOUT: ITransaction = {
                amount: Number(request.amount),
                bank_id: request.bank_id,
                type: TransactionType.OUT,
                organization_id: request.organization_id,
                order_type: TransactionOrderType.INTEREST,
            };
            await this.transactionRepo.create(transactionOUT, tx);

            // eventbus.emit(EVENT_PAYMENT_CREATED, transactionOUT as ITransaction);
        }

        return {
            id: depositId,
        };
    }

    /**
     * Cập nhật thông tin một khoản tiền gửi, bao gồm tính toán ngày rút tiền và lãi suất.
     * Nhân viên chỉ được phép cập nhật thông tin khoản tiền gửi nếu khoản tiền gửi đó chưa được xác nhận hoặc đã được xác nhận nhưng chưa cập nhật quá 1 lần.
     * @param id - The ID of the deposit to update
     * @param request - The update request containing term, interest rate, and other fields
     * @param tx - Optional transaction client for database operations
     * @returns The updated deposit record
     * @throws APIError if the deposit with the given ID does not exist
     */
    public async updateDeposit(id: number, request: IDepositUpdate, tx?: Prisma.TransactionClient): Promise<any> {
        // Validate foreign keys
        const existingDeposit = await this.repo.findOne({ id }, true);

        if (!existingDeposit) {
            throw new APIError({ message: 'id.not_found', status: 400, errors: ['id.not_found'] });
        }

        if (
            (existingDeposit.status === 'confirmed' && (existingDeposit.update_count as number) >= 1) ||
            existingDeposit.status === 'rejected'
        ) {
            throw new APIError({
                message: 'status.cannot_edit',
                status: 400,
                errors: ['status.cannot_edit'],
            });
        }

        let dataUpdate: IDepositUpdate = {};

        if (existingDeposit.status === 'pending') {
            if (request.deposit_date) {
                dataUpdate.deposit_date = request.deposit_date;
            }

            if (request.amount) {
                dataUpdate.amount = request.amount;
            }

            if (request.bank_id) {
                dataUpdate.bank_id = request.bank_id;
            }
        } else {
            if (!request.interest_rate || !request.account_number || !request.unit || !request.term) {
                throw new APIError({
                    message: 'deposit.update_fields_required',
                    status: 400,
                    errors: ['deposit.update_fields_required'],
                });
            }
            const withdraw_date = moment(existingDeposit.deposit_date).add(request.term, 'months').toISOString();
            const compound_interest =
                Number(existingDeposit.amount) *
                Math.pow(1 + (request.interest_rate as number) / 100, (request.term as number) / 12);

            // If the deposit is confirmed, we can only update the withdraw_date and compound_interest
            dataUpdate = {
                account_number: request.account_number,
                interest_rate: request.interest_rate,
                unit: request.unit,
                term: request.term,
                withdraw_date,
                compound_interest,
                // update_count: (existingDeposit.update_count as number) + 1,
            };
        }

        // Update the deposit record
        const updatedDeposit = await this.repo.update({ id: id }, dataUpdate, tx);
        return updatedDeposit;
    }

    /**
     * Phê duyệt hoặc từ chối một khoản tiền gửi, nếu phê duyệt thì cập nhật trạng thái và tạo các giao dịch tương ứng.
     * @param id - The ID of the deposit to approve
     * @param request - The approval request containing status, file, and note
     * @returns The updated deposit record
     * @throws Error if the deposit with the given ID does not exist
     */
    public async approve(id: number, request: IDepositApprove, tx?: Prisma.TransactionClient): Promise<any> {
        // Validate foreign keys
        const existingDeposit = await this.repo.findOne({ id });
        if (!existingDeposit) {
            throw new APIError({ message: 'id.not_found', status: 400, errors: ['id.not_found'] });
        }

        if (existingDeposit.status !== 'pending') {
            throw new APIError({
                message: 'status.already_confirmed',
                status: 400,
                errors: ['status.already_confirmed'],
            });
        }

        const bank = await this.bankRepo.findOne({ id: existingDeposit.bank_id });
        if (!bank) {
            throw new APIError({ message: 'bank_id.not_found', status: 400, errors: ['bank_id.not_found'] });
        }

        if (Number(existingDeposit.amount) > Number(bank.balance)) {
            throw new APIError({
                message: 'amount.amount_exceed_balance',
                status: 400,
                errors: ['amount.amount_exceed_balance'],
            });
        }

        // Update the deposit status to approved
        if (request.file) {
            let files = existingDeposit.files || [];
            files.push(request.file);

            delete (request as Partial<typeof request>).file;

            request.files = files;
        }

        if (request.status === 'rejected') {
            if (!request.rejected_reason) {
                throw new APIError({
                    message: 'rejected_reason.required',
                    status: 400,
                    errors: ['rejected_reason.required'],
                });
            }
        }

        const updatedDeposit = await this.repo.update({ id }, request, tx);

        // create a transaction for the deposit
        if (request.status === 'confirmed') {
            if (updatedDeposit) {
                // Trừ số dư khả dụng trong tài khoản ngân hàng
                await this.bankRepo.update(
                    { id: existingDeposit.bank_id },
                    { balance: Number(bank.balance) - Number(existingDeposit.amount) },
                    tx,
                );

                // const transactionIN: ITransaction = {
                //     amount: existingDeposit.amount ? Number(existingDeposit.amount) : undefined,
                //     bank_id: existingDeposit.bank_id,
                //     type: TransactionType.IN,
                //     organization_id: existingDeposit.organization_id ?? undefined,
                //     order_type: TransactionOrderType.TRANSFER,
                // };
                // await this.transactionRepo.create(transactionIN, tx);

                const transactionOUT: ITransaction = {
                    amount: existingDeposit.amount ? Number(existingDeposit.amount) : undefined,
                    bank_id: existingDeposit.bank_id,
                    type: TransactionType.OUT,
                    organization_id: existingDeposit.organization_id ?? undefined,
                    order_type: TransactionOrderType.TRANSFER,
                };
                await this.transactionRepo.create(transactionOUT, tx);

                // eventbus.emit(EVENT_PAYMENT_CREATED, transactionOUT as ITransaction);
            }
        }

        return { id: updatedDeposit };
    }

    public async delete(id: number): Promise<IIdResponse> {
        // Validate foreign keys
        const existingDeposit = await this.repo.findOne({ id });
        if (!existingDeposit) {
            throw new APIError({ message: 'deposit.not_found', status: 400, errors: ['deposit.not_found'] });
        }

        if (existingDeposit.status !== 'pending') {
            throw new APIError({
                message: 'deposit.cannot_edit',
                status: 400,
                errors: ['deposit.cannot_edit'],
            });
        }

        // Delete the deposit record
        await this.repo.delete({ id });

        return { id };
    }

    /**
     * Tất toán khoản tiền gửi , nhập số tiền nhận dược thực tế để tính lãi
     * @param id
     * @param request
     * @returns
     */
    public async settlement(id: number, request: IDepositSettlement, isAdmin: boolean) {
        // Validate foreign keys
        const existingDeposit = await this.repo.findOne({ id });
        if (!existingDeposit) {
            throw new APIError({ message: 'id.not_found', status: 400, errors: ['id.not_found'] });
        }

        // if (existingDeposit.status !== 'confirmed') {
        //     throw new APIError({
        //         message: 'deposit.not_confirmed',
        //         status: 400,
        //         errors: ['deposit.not_confirmed'],
        //     });
        // }

        // Nếu rút trước ngày rút tiền thì phải là admin thực hiện
        if (moment(request.real_withdraw_date).isBefore(existingDeposit.withdraw_date, 'days') && !isAdmin) {
            throw new APIError({
                message: 'auth.cannot_edit',
                status: 400,
                errors: ['auth.cannot_edit'],
            });
        }

        // Update the deposit record with settlement information
        const updatedDeposit = await this.repo.update(
            { id },
            {
                real_compound_interest: request.real_compound_interest,
                interest_amount: request.real_compound_interest - Number(existingDeposit.amount),
            },
        );

        return updatedDeposit;
    }

    public async paginates(query: IPaginationInput): Promise<IPaginationResponse> {
        const result = await this.repo.paginate(query, true);
        return result;
    }
}
