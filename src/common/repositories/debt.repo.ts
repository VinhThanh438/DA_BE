import { Debts, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { DebtSelection, DebtSelectionAll } from './prisma/prisma.select';

export class DebtRepo extends BaseRepo<Debts, Prisma.DebtsSelect, Prisma.DebtsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().debts;
    protected defaultSelect = DebtSelection;
    protected detailSelect = DebtSelectionAll;
    protected modelKey = 'debts' as const;
}
