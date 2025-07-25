import { Loans, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { SearchField } from '@common/interfaces/common.interface';
import { LoanSelection, LoanSelectionAll } from './prisma/prisma.select';

export class LoanRepo extends BaseRepo<Loans, Prisma.LoansSelect, Prisma.LoansWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().loans;
    protected defaultSelect = LoanSelection;
    protected detailSelect = LoanSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'loans';
    protected timeFieldDefault: string = 'created_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['account_number'] }, { path: ['bank', 'bank'] }],
    };
}
