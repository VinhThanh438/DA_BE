import { Prisma, Transactions } from '.prisma/client';
import { BaseService } from './base.service';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';

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
}
