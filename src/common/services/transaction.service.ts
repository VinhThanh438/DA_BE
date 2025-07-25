import { $Enums, Prisma, Transactions } from '.prisma/client';
import { BaseService } from './master/base.service';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { IFilterArgs, IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey, StatusCode } from '@common/errors';
import { ITransaction } from '@common/interfaces/transaction.interface';
import { PaymentRequestRepo } from '@common/repositories/payment-request.repo';
import { PaymentRequestDetailRepo } from '@common/repositories/payment-request-details.repo';
import { BankRepo } from '@common/repositories/bank.repo';
import { TimeAdapter } from '@common/infrastructure/time.adapter';
import { TransactionSelectWithBankOrder } from '@common/repositories/prisma/prisma.select';

export class TransactionService extends BaseService<Transactions, Prisma.UsersSelect, Prisma.TransactionsWhereInput> {
    private static instance: TransactionService;
    private paymentRequestRepo: PaymentRequestRepo = new PaymentRequestRepo();
    private paymentRequestDetailRepo: PaymentRequestDetailRepo = new PaymentRequestDetailRepo();
    private bankRepo: BankRepo = new BankRepo();

    private constructor() {
        super(new TransactionRepo());
    }

    public static getInstance(): TransactionService {
        if (!this.instance) {
            this.instance = new TransactionService();
        }
        return this.instance;
    }

    public paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const { bankId, ...rest } = query;
        const where = { ...rest, ...(bankId && { bank_id: Number(bankId) }) };
        return this.repo.paginate(where);
    }

    async getAllTransactions(filter: IFilterArgs) {
        const { id: bankId, orderIds = [], startAt, endAt } = filter;
        const bankExist = await this.bankRepo.findOne({ id: parseInt(bankId?.toString() || '0') });
        if (!bankExist) {
            throw new APIError({
                message: `common.bank_id.${StatusCode.BAD_REQUEST}`,
                status: ErrorCode.BAD_REQUEST,
                errors: [`bank_id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const where = {
            ...(bankId && { bank_id: parseInt(bankId.toString()) }),
            ...(orderIds.length > 0 && { order_id: { in: orderIds.map((i: any) => parseInt(i)) } }),
            ...((startAt || endAt) && {
                time_at: {
                    ...(startAt && { gte: TimeAdapter.parseStartOfDayDate(startAt) }),
                    ...(endAt && { lte: TimeAdapter.parseEndOfDayDate(endAt) }),
                },
            }),
        } as Prisma.TransactionsWhereInput;
        const transactions = await this.db.transactions.findMany({
            where,
            select: TransactionSelectWithBankOrder,
        });

        return { transactions, beginning: await this.calBeginning(startAt, Number(bankExist.beginning_balance)) };
    }

    private async calBeginning(startAt: any, beginningBalance: number) {
        if (!startAt) return 0;
        // số dư đầu kỳ = số dư ban đầu + tăng - giảm
        const calIncrease = await this.db.transactions.aggregate({
            where: {
                time_at: { lte: new Date(startAt).toISOString() },
                type: 'in',
            },
            _sum: { amount: true },
        });
        const calDecrease = await this.db.transactions.aggregate({
            where: {
                time_at: { lte: new Date(startAt).toISOString() },
                type: 'out',
            },
            _sum: { amount: true },
        });
        const calBeginning =
            parseInt(beginningBalance?.toString()) +
            parseInt(calIncrease._sum?.amount?.toString() || '0') -
            parseInt(calDecrease._sum?.amount?.toString() || '0');
        return calBeginning;
    }

    public async createTransactionByPaymentRequestDetail(
        paymentRequestDetailId: number,
        otherData: ITransaction,
    ): Promise<ITransaction | null> {
        const paymentRequestDetail = await this.paymentRequestDetailRepo.findOne({
            id: paymentRequestDetailId,
        });
        if (paymentRequestDetail) {
            const { order_id, invoice_id, payment_request_id, ...paymentRequestDetailData } = paymentRequestDetail;

            const paymentRequest = await this.paymentRequestRepo.findOne({
                id: payment_request_id as number,
            });

            const createdId = await this.repo.create({
                ...otherData,
                order_type: paymentRequest?.type,
                order: order_id ? { connect: { id: order_id } } : undefined,
                invoice: invoice_id ? { connect: { id: invoice_id } } : undefined,
            });

            const transaction = await this.repo.findOne({ id: createdId }, true);

            return transaction as ITransaction;
        }
        return null;
    }

    public async getAll(
        data: Prisma.TransactionsWhereInput,
        isDefaultSelect: boolean = false,
    ): Promise<Partial<Transactions>[]> {
        return this.repo.findMany(data, isDefaultSelect);
    }
}
