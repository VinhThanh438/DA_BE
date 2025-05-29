import { Prisma, Transactions } from '.prisma/client';
import { BaseService } from './base.service';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { IFilterArgs, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { TransactionSelectWithBankOrder } from '@common/repositories/prisma/transaction.select';
import { TransactionOrderType } from '@config/app.constant';

export class TransactionService extends BaseService<Transactions, Prisma.UsersSelect, Prisma.TransactionsWhereInput> {
    private static instance: TransactionService;

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
        const { bankIds = [], orderIds = [], startAt, endAt } = filter;
        const where = {
            ...(bankIds.length > 0 && { bank_id: { in: bankIds } }),
            ...(orderIds.length > 0 && { order_id: { in: orderIds } }),
            ...((startAt || endAt) && {
                time_at: {
                    ...(startAt && { gte: new Date(startAt).toISOString() }),
                    ...(endAt && { lte: new Date(endAt).toISOString() }),
                },
            }),
            order_type: TransactionOrderType.ORDER,
        };
        const transactions = await this.db.transactions.findMany({
            where,
            select: TransactionSelectWithBankOrder,
        });

        return { transactions, beginning: await this.calBeginning(startAt) };
    }

    private async calBeginning(startAt: any) {
        if (!startAt) return 0;
        const calBeginning = await this.db.transactions.aggregate({
            where: {
                time_at: { lte: new Date(startAt).toISOString() },
            },
            _sum: { amount: true },
        });
        return parseInt(calBeginning._sum?.amount?.toString() || '0') || 0;
    }
}
