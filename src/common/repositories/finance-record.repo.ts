import { FinanceRecords, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { FinanceRecordSelection, FinanceRecordSelectionAll } from './prisma/finance-record.select';

export class FinanceRecordRepo extends BaseRepo<
    FinanceRecords,
    Prisma.FinanceRecordsSelect,
    Prisma.FinanceRecordsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().financeRecords;
    protected defaultSelect = FinanceRecordSelection;
    protected detailSelect = FinanceRecordSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'financeRecords';
}
