import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { SearchField } from '@common/interfaces/common.interface';
import { Commissions, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { CommissionSelection, CommissionSelectionAll } from './prisma/prisma.select';

export class CommissionRepo extends BaseRepo<Commissions, Prisma.CommissionsSelect, Prisma.CommissionsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().commissions;
    protected defaultSelect = CommissionSelection;
    protected detailSelect = CommissionSelectionAll;
    protected timeFieldDefault: string = 'created_at';
    protected modelKey: keyof Prisma.TransactionClient = 'commissions';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [],
    };
}
