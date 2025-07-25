import { CommonDetails, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { CommonDetailSelection, CommonDetailSelectionAll } from './prisma/prisma.select';

export class CommonDetailRepo extends BaseRepo<
    CommonDetails,
    Prisma.CommonDetailsSelect,
    Prisma.CommonDetailsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().commonDetails;
    protected defaultSelect = CommonDetailSelection;
    protected detailSelect = CommonDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'commonDetails';
}
