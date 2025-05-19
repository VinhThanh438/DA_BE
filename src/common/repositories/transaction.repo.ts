import { Prisma, Transactions } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { TransactionSelect, TransactionSelectAll } from './prisma/transaction.select';

export class TransactionRepo extends BaseRepo<Transactions, Prisma.TransactionsSelect, Prisma.TransactionsWhereInput> {
    protected db = DatabaseAdapter.getInstance().transactions;
    protected defaultSelect = TransactionSelect;
    protected detailSelect = TransactionSelectAll;
    protected modelKey = 'transactions' as const;
}
