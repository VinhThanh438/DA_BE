import { BaseService } from './base.service';
import { Payments, Prisma } from '.prisma/client';
import { IApproveRequest, IIdResponse, IPaginationInput } from '@common/interfaces/common.interface';
import {
    IFundBalanceReport,
    IPayment,
    IPaymentLedger,
    IPaymentLedgerDetail,
} from '@common/interfaces/payment.interface';
import { PaymentRepo } from '@common/repositories/payment.repo';
import { PaymentRequestRepo } from '@common/repositories/payment-request.repo';
import { handleFiles } from '@common/helpers/handle-files';
import { deleteFileSystem } from '@common/helpers/delete-file-system';
import { PaymentType, TransactionType } from '@config/app.constant';
import { OrderRepo } from '@common/repositories/order.repo';
import { InvoiceRepo } from '@common/repositories/invoice.repo';
import { BankRepo } from '@common/repositories/bank.repo';
import eventbus from '@common/eventbus';
import { EVENT_LOAN_PAID, EVENT_PAYMENT_CREATED, EVENT_PAYMENT_DELETED } from '@config/event.constant';
import { IPaymentCreatedEvent, IPaymentDeletedEvent, ITransaction } from '@common/interfaces/transaction.interface';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { transformDecimal } from '@common/helpers/transform.util';
import { TimeHelper } from '@common/helpers/time.helper';
import { PaymentRequestDetailRepo } from '@common/repositories/payment-request-details.repo';

export class PaymentService extends BaseService<Payments, Prisma.PaymentsSelect, Prisma.PaymentsWhereInput> {
    private static instance: PaymentService;
    private paymentRequestRepo: PaymentRequestRepo = new PaymentRequestRepo();
    private paymentRequestDetailRepo: PaymentRequestDetailRepo = new PaymentRequestDetailRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private invoiceRepo: InvoiceRepo = new InvoiceRepo();
    private bankRepo: BankRepo = new BankRepo();
    private transactionRepo: TransactionRepo = new TransactionRepo();
    private organizationRepo: OrganizationRepo = new OrganizationRepo();

    private constructor() {
        super(new PaymentRepo());
    }

    public static getInstance(): PaymentService {
        if (!this.instance) {
            this.instance = new PaymentService();
        }
        return this.instance;
    }

    public async createPayment(request: Partial<IPayment>): Promise<IIdResponse> {
        try {
            await this.validateForeignKeys(request, {
                payment_request_detail_id: this.paymentRequestDetailRepo,
                order_id: this.orderRepo,
                invoice_id: this.invoiceRepo,
                bank_id: this.bankRepo,
                organization_id: this.organizationRepo,
            });

            const {
                id,
                payment_request_detail_id,
                order_id,
                invoice_id,
                bank_id,
                organization_id,
                category,
                interest_log_id,
                loan_id,
                ...paymentData
            } = request;

            let bank = null;
            if (bank_id) {
                bank = await this.bankRepo.findOne({ id: bank_id });
                if (bank && bank.balance != null && (paymentData.amount ?? 0) > Number(bank.balance)) {
                    throw new APIError({
                        message: `common.status.${StatusCode.BAD_REQUEST}`,
                        status: ErrorCode.BAD_REQUEST,
                        errors: [`bank_id.${ErrorKey.INVALID}`],
                    });
                }
            }

            const paymentRequestDetail = await this.paymentRequestDetailRepo.findOne({ id: payment_request_detail_id });
            if (payment_request_detail_id && !paymentRequestDetail) {
                throw new APIError({
                    message: `common.status.${StatusCode.BAD_REQUEST}`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`payment_request_detail.${ErrorKey.NOT_FOUND}`],
                });
            }

            const paymentRequest = await this.paymentRequestRepo.findOne({
                id: paymentRequestDetail?.payment_request_id as number,
            });

            if (!paymentRequest) {
                throw new APIError({
                    message: `common.status.${StatusCode.BAD_REQUEST}`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`payment_request.${ErrorKey.INVALID}`],
                });
            }

            const partnerId = paymentRequest ? paymentRequest.partner_id : undefined;

            paymentData.payment_request_detail = payment_request_detail_id
                ? ({ connect: { id: payment_request_detail_id } } as any)
                : undefined;
            paymentData.order = order_id ? ({ connect: { id: order_id } } as any) : undefined;
            paymentData.invoice = invoice_id ? ({ connect: { id: invoice_id } } as any) : undefined;
            paymentData.partner = partnerId ? ({ connect: { id: partnerId } } as any) : undefined;
            paymentData.bank = bank_id ? ({ connect: { id: bank_id } } as any) : undefined;
            paymentData.organization = organization_id ? ({ connect: { id: organization_id } } as any) : undefined;
            paymentData.interest_log = interest_log_id ? ({ connect: { id: interest_log_id } } as any) : undefined;

            const resultId = await this.repo.create(paymentData);

            if (resultId) {
                const eventData = {
                    order_type: category || undefined,
                    note: request.description,
                    new_bank_balance: Number(bank?.balance) - Number(request.amount),
                    amount: request.amount,
                    bank_id: request.bank_id,
                    interest_log_id: interest_log_id,
                    bank: request.bank_id ? { connect: { id: request.bank_id } } : undefined,
                    payment: { connect: { id: resultId } },
                    type:
                        request.type && (request.type as unknown) === PaymentType.INCOME
                            ? TransactionType.IN
                            : TransactionType.OUT,
                    description: request.note,
                    invoice: request.invoice_id ? { connect: { id: request.invoice_id } } : undefined,
                    invoice_id: request.invoice_id,
                    order: request.order_id ? { connect: { id: request.order_id } } : undefined,
                    partner: partnerId ? { connect: { id: partnerId } } : undefined,
                    organization: request.organization_id ? { connect: { id: request.organization_id } } : undefined,
                    time_at: paymentData.payment_date,
                    payment_request_detail_id: request.payment_request_detail_id,
                };
                eventbus.emit(EVENT_PAYMENT_CREATED, eventData as IPaymentCreatedEvent);
                if (loan_id) {
                    eventbus.emit(EVENT_LOAN_PAID, {
                        ...paymentData,
                        loan_id: Number(loan_id),
                        amount: Number(request.amount),
                    } as IPaymentCreatedEvent);
                }
            }
            return { id: resultId };
        } catch (error) {
            if (request.files?.length) {
                deleteFileSystem(request.files);
            }
            throw error;
        }
    }

    public async updatePayment(id: number, request: Partial<IPayment>): Promise<IIdResponse> {
        const { files_add, files_delete, ...paymentData } = request;
        try {
            const paymentExist = await this.findById(id);
            await this.validateForeignKeys(request, {
                payment_request_id: this.paymentRequestRepo,
                order_id: this.orderRepo,
                invoice_id: this.invoiceRepo,
                partner_id: this.repo,
            });

            // handle files
            let filesUpdate = handleFiles(files_add, files_delete, paymentExist?.files);

            await this.repo.update(
                { id },
                {
                    ...paymentData,
                    ...(filesUpdate !== null && { files: filesUpdate }),
                },
            );

            // clean up file
            if (files_delete && files_delete.length > 0) {
                deleteFileSystem(files_delete);
            }

            return { id };
        } catch (error) {
            if (files_add && files_add.length > 0) {
                deleteFileSystem(files_add);
            }
            throw error;
        }
    }

    public async approve(id: number, body: IApproveRequest): Promise<IIdResponse> {
        const payment = await this.validateStatusApprove(id);

        const paymentUpdateId = await this.repo.update({ id }, body);

        if (paymentUpdateId) {
            const transaction = {
                amount: payment.amount,
                bank: payment.bank_id ? { connect: { id: payment.bank_id } } : undefined,
                payment: { connect: { id } },
                type: payment.type && payment.type === PaymentType.INCOME ? TransactionType.IN : TransactionType.OUT,
                invoice: payment.invoice_id ? { connect: { id: payment.invoice_id } } : undefined,
                order: payment.order_id ? { connect: { id: payment.order_id } } : undefined,
                partner: payment.partner_id ? { connect: { id: payment.partner_id } } : undefined,
                organization: payment.organization_id ? { connect: { id: payment.organization_id } } : undefined,
                payment_request_id: payment.payment_request_id,
            };
            eventbus.emit(EVENT_PAYMENT_CREATED, transaction as ITransaction);
        }

        return { id };
    }

    public async close(request: any): Promise<void> {
        const { bankId, ...rest } = request;
        const conditions = { bank_id: parseInt(bankId), is_closed: false };
        await this.transactionRepo.updateManyByCondition(conditions, {
            is_closed: true,
        });
    }

    public async delete(id: number): Promise<IIdResponse> {
        const payment = await this.repo.findOne({ id });
        if (!payment) {
            throw new APIError({
                message: `common.status.${StatusCode.BAD_REQUEST}`,
                status: ErrorCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.INVALID}`],
            });
        }
        const deletedId = await this.repo.delete({ id });
        if (deletedId) {
            const refund = payment.amount;
            eventbus.emit(EVENT_PAYMENT_DELETED, { bank_id: payment.bank_id, refund } as IPaymentDeletedEvent);
        }
        return { id: deletedId };
    }

    public async report(request: IPaginationInput): Promise<IFundBalanceReport[]> {
        const { startAt, endAt, organization_id } = request;

        const banks = await this.bankRepo.findMany({ organization_id });

        const result = await Promise.all(
            banks.map(async (bank) => {
                // Period
                const periodTransactions = await this.transactionRepo.findMany({
                    time_at: { gte: startAt, lte: endAt },
                    bank_id: bank.id,
                });

                let periodIncrease = 0;
                let periodReduction = 0;
                let beginning = 0;
                let currentBalance = Number(bank.balance);

                for (const tx of periodTransactions) {
                    const amount = Number(tx.amount);
                    if (tx.type === TransactionType.IN) periodIncrease += amount;
                    else if (tx.type === TransactionType.OUT) periodReduction += amount;
                }

                if (endAt && TimeHelper.getCurrentDate() > TimeHelper.parseToDate(endAt)) {
                    let endingIncrease = 0;
                    let endingReduction = 0;
                    const endingTransactions = await this.transactionRepo.findMany({
                        time_at: { gte: TimeHelper.parseToDate(endAt), lte: TimeHelper.getCurrentDate() },
                        bank_id: bank.id,
                    });
                    for (const tx of endingTransactions) {
                        const amount = Number(tx.amount);
                        if (tx.type === TransactionType.IN) endingIncrease += amount;
                        else if (tx.type === TransactionType.OUT) endingReduction += amount;
                    }
                    currentBalance -= endingIncrease - endingReduction;
                }

                beginning = currentBalance - (periodIncrease - periodReduction);

                const ending = beginning + periodIncrease - periodReduction;

                return {
                    bank,
                    beginning,
                    increase: periodIncrease,
                    reduction: periodReduction,
                    ending,
                } as IFundBalanceReport;
            }),
        );

        return transformDecimal(result);
    }

    public async ledger(request: IPaginationInput): Promise<IPaymentLedger> {
        const { startAt, endAt, organization_id, bankId, ...query } = request;

        const bank = await this.bankRepo.findOne({ organization_id, id: bankId });
        if (!bank) {
            throw new APIError({
                message: `common.status.${StatusCode.BAD_REQUEST}`,
                status: ErrorCode.BAD_REQUEST,
                errors: [`bank.${ErrorKey.NOT_FOUND}`],
            });
        }

        // beginning
        const currentBalance = Number(bank.balance);
        const transactions = await this.transactionRepo.findMany({
            bank_id: bankId,
        });

        let totalIncrease = 0;
        let totalReduction = 0;

        for (const tx of transactions) {
            const amount = Number(tx.amount);
            if (tx.type === TransactionType.IN) {
                totalIncrease += amount;
            } else if (tx.type === TransactionType.OUT) {
                totalReduction += amount;
            }
        }

        let beginning = currentBalance - (totalIncrease - totalReduction);
        let ending = 0;
        let beginningIncrease = 0;
        let reductionIncrease = 0;

        const beginningConditions = { time_at: { lte: startAt }, bank_id: bankId };
        const beginningTransactions = await this.transactionRepo.findMany(beginningConditions);
        for (const tx of beginningTransactions) {
            const amount = Number(tx.amount);
            if (tx.type === TransactionType.IN) beginningIncrease += amount;
            else if (tx.type === TransactionType.OUT) reductionIncrease += amount;
        }
        beginning += beginningIncrease - reductionIncrease;

        // period
        let periodIncrease = 0;
        let periodReduction = 0;
        ending = beginning;
        const periodConditions = { time_at: { lte: endAt, gte: startAt }, bank_id: bankId };
        const periodTransactions = await this.transactionRepo.findMany({ ...periodConditions });
        let transactionDataList: IPaymentLedgerDetail[] = [];
        for (const tx of periodTransactions as ITransaction[]) {
            const amount = Number(tx.amount);
            if (tx.type === TransactionType.IN) {
                periodIncrease += amount;
                ending += amount;
            } else if (tx.type === TransactionType.OUT) {
                periodReduction += amount;
                ending -= amount;
            }

            const transactionData = {
                time_at: tx.time_at,
                type: tx.type,
                note: tx.description || '',
                is_closed: tx.is_closed,
                increase: tx.type === TransactionType.IN ? amount : 0,
                reduction: tx.type === TransactionType.OUT ? amount : 0,
                ending,
            } as IPaymentLedgerDetail;
            transactionDataList.push(transactionData);
        }
        ending = beginning + periodIncrease - periodReduction;
        return {
            beginning,
            increase: periodIncrease,
            reduction: periodReduction,
            ending,
            details: transactionDataList,
        };
    }
}
