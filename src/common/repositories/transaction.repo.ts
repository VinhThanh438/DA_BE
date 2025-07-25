import { Prisma, Transactions } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { TransactionSelect, TransactionSelectAll } from './prisma/prisma.select';

export class TransactionRepo extends BaseRepo<Transactions, Prisma.TransactionsSelect, Prisma.TransactionsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().transactions;
    protected defaultSelect = TransactionSelect;
    protected detailSelect = TransactionSelectAll;
    protected modelKey = 'transactions' as const;
    protected timeFieldDefault: string = 'time_at';
}
