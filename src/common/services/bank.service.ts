import { BankRepo } from '@common/repositories/bank.repo';
import { BaseService } from './master/base.service';
import { Banks, Prisma } from '.prisma/client';
import { IBankTransfer } from '@common/interfaces/bank.interface';
import { IBank } from '@common/interfaces/bank.interface';
import { APIError } from '@common/error/api.error';
import { ErrorKey, StatusCode } from '@common/errors';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { TransactionType } from '@config/app.constant';
import { TimeAdapter } from '@common/infrastructure/time.adapter';

// Interface cho fund balance response
export interface IBankFundBalance extends IBank {
    beginning: number; // Tồn đầu kỳ
    increase: number; // Tăng trong kỳ
    decrease: number; // Giảm trong kỳ
    ending: number; // Tồn cuối kỳ
    total_transactions: number; // Tổng số giao dịch
}

export class BankService extends BaseService<Banks, Prisma.BanksSelect, Prisma.BanksWhereInput> {
    private static instance: BankService;
    private transactionRepo: TransactionRepo = new TransactionRepo();

    private constructor() {
        super(new BankRepo());
    }

    public static getInstance(): BankService {
        if (!this.instance) {
            this.instance = new BankService();
        }
        return this.instance;
    }

    /**
     * Phương thức chuyển tiền giữa các tài khoản ngân hàng, hiện tại chỉ hỗ trợ chuyển đến 1 tài khoản tiền gửi của công ty
     * @param request - Thông tin chuyển tiền bao gồm ID ngân hàng chuyển và nhận
     **/
    public async transfer(request: IBankTransfer, tx?: Prisma.TransactionClient): Promise<any> {
        const bank = await this.findOne(
            {
                id: request.bank_id,
            },
            true,
        );

        if (bank?.type === 'deposit') {
            // Tạo dữ liệu trong bảng deposits
            // const depositData: IDepositCreate = {
            //     deposit_date: request.time_at,
            //     amount: request.amount,
            //     unit: 'VND',
            //     bank_id: request.bank_id,
            //     organization_id: request.organization_id,
            // };
            // const data = await this.depositRepo.create(depositData, tx);
            // return data;
        } else {
            throw new APIError({ message: 'type.invalid', status: 400, errors: ['type.invalid'] });
        }
    }

    /**
     * Tạo mới ngân hàng
     * @param body - Thông tin ngân hàng cần tạo
     * @returns Ngân hàng mới được tạo
     * @throws APIError nếu ngân hàng đã tồn tại hoặc số tài khoản đã tồn tại
     */
    public async createBank(body: IBank): Promise<IIdResponse> {
        const existingBankByName = await this.repo.findFirst({
            bank: body.bank.trim(),
            organization_id: body.organization_id,
        });

        if (existingBankByName)
            throw new APIError({ message: 'bank.duplicate', status: 409, errors: ['bank.duplicate'] });

        if (body.account_number?.trim()) {
            const existingBankByAccount = await this.repo.findFirst({
                account_number: body.account_number.trim(),
                organization_id: body.organization_id,
            });

            if (existingBankByAccount)
                throw new APIError({
                    message: 'account_number.duplicate',
                    status: 409,
                    errors: ['account_number.duplicate'],
                });
        }

        const createdId = await this.repo.create({ ...body, beginning_balance: body.balance || 0 });

        return { id: createdId };
    }

    public async fundBalance(query: IPaginationInput): Promise<IPaginationResponse> {
        const { startAt, endAt, ...filters } = query;

        const parsedStartAt = TimeAdapter.parseStartOfDayDate(startAt as string).toISOString();
        const parsedEndAt = TimeAdapter.parseEndOfDayDate(endAt as string).toISOString();

        // Lấy danh sách banks theo filter
        const banksResult = await this.repo.paginate(filters, true);

        // Tính toán fund balance cho từng bank
        const banksWithFundBalance: IBankFundBalance[] = await Promise.all(
            banksResult.data.map(async (bank: IBank) => {
                // Lấy tất cả transactions của bank này
                const allTransactions = await this.transactionRepo.findMany({
                    bank_id: bank.id,
                });

                // Phân loại transactions theo thời gian
                const beforeTransactions = allTransactions.filter(
                    (tx) => tx.time_at && new Date(tx.time_at) < new Date(parsedStartAt),
                );

                const inPeriodTransactions = allTransactions.filter((tx) => {
                    if (!tx.time_at) return false;
                    const txTime = new Date(tx.time_at);
                    return txTime >= new Date(parsedStartAt) && txTime <= new Date(parsedEndAt);
                });

                // Tính tồn đầu kỳ (số dư ban đầu + giao dịch trước kỳ)
                const beforeIncrease = beforeTransactions.reduce(
                    (sum, tx) => sum + (tx.type === TransactionType.IN ? Number(tx.amount || 0) : 0),
                    0,
                );

                const beforeDecrease = beforeTransactions.reduce(
                    (sum, tx) => sum + (tx.type === TransactionType.OUT ? Number(tx.amount || 0) : 0),
                    0,
                );

                const beginningBalance = Number(bank.beginning_balance || 0) + beforeIncrease - beforeDecrease;

                // Tính tăng/giảm trong kỳ
                const increaseAmount = inPeriodTransactions.reduce(
                    (sum, tx) => sum + (tx.type === TransactionType.IN ? Number(tx.amount || 0) : 0),
                    0,
                );

                const decreaseAmount = inPeriodTransactions.reduce(
                    (sum, tx) => sum + (tx.type === TransactionType.OUT ? Number(tx.amount || 0) : 0),
                    0,
                );

                // Tính tồn cuối kỳ
                const endingBalance = beginningBalance + increaseAmount - decreaseAmount;

                return {
                    ...bank,
                    beinning: beginningBalance,
                    increase: increaseAmount,
                    reduction: decreaseAmount,
                    ending: endingBalance,
                };
            }),
        );
        banksResult.data = banksWithFundBalance;

        return banksResult;
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const { startAt, endAt, ...filters } = query;

        if (startAt && endAt) {
            return await this.fundBalance(query);
        } else {
            return await this.repo.paginate(query);
        }
    }

    /**
     * Lấy fund balance chi tiết cho một bank cụ thể
     * @param bankId - ID của bank
     * @param startAt - Ngày bắt đầu
     * @param endAt - Ngày kết thúc
     * @returns Fund balance chi tiết của bank
     */
    public async getFundBalanceById(bankId: number, startAt: string, endAt: string): Promise<IBankFundBalance> {
        const bank = await this.repo.findOne({ id: bankId }, true);

        if (!bank) {
            throw new APIError({
                message: 'common.not-found',
                status: StatusCode.REQUEST_NOT_FOUND,
                errors: [`bank.${ErrorKey.NOT_FOUND}`],
            });
        }

        const parsedStartAt = TimeAdapter.parseStartOfDayDate(startAt).toISOString();
        const parsedEndAt = TimeAdapter.parseEndOfDayDate(endAt).toISOString();

        // Lấy tất cả transactions của bank này
        const allTransactions = await this.transactionRepo.findMany(
            {
                bank_id: bankId,
            },
            true,
        );

        // Phân loại transactions theo thời gian
        const beforeTransactions = allTransactions.filter(
            (tx) => tx.time_at && new Date(tx.time_at) < new Date(parsedStartAt),
        );

        const inPeriodTransactions = allTransactions.filter((tx) => {
            if (!tx.time_at) return false;
            const txTime = new Date(tx.time_at);
            return txTime >= new Date(parsedStartAt) && txTime <= new Date(parsedEndAt);
        });

        // Tính tồn đầu kỳ
        const beforeIncrease = beforeTransactions.reduce(
            (sum, tx) => sum + (tx.type === TransactionType.IN ? Number(tx.amount || 0) : 0),
            0,
        );

        const beforeDecrease = beforeTransactions.reduce(
            (sum, tx) => sum + (tx.type === TransactionType.OUT ? Number(tx.amount || 0) : 0),
            0,
        );

        const beginningBalance = Number(bank.beginning_balance || 0) + beforeIncrease - beforeDecrease;

        // Tính tăng/giảm trong kỳ
        const increaseAmount = inPeriodTransactions.reduce(
            (sum, tx) => sum + (tx.type === TransactionType.IN ? Number(tx.amount || 0) : 0),
            0,
        );

        const decreaseAmount = inPeriodTransactions.reduce(
            (sum, tx) => sum + (tx.type === TransactionType.OUT ? Number(tx.amount || 0) : 0),
            0,
        );

        // Tính tồn cuối kỳ
        const endingBalance = beginningBalance + increaseAmount - decreaseAmount;

        return {
            ...bank,
            beginning: beginningBalance,
            increase: increaseAmount,
            decrease: decreaseAmount,
            ending: endingBalance,
            transactions: inPeriodTransactions,
        } as IBankFundBalance & { transactions: any[] };
    }
}
