import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BomDetails, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { BomDetailSelection, BomDetailSelectionAll } from './prisma/prisma.select';

export class BomDetailRepo extends BaseRepo<BomDetails, Prisma.BomDetailsSelect, Prisma.BomDetailsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().bomDetails;
    protected defaultSelect = BomDetailSelection;
    protected detailSelect = BomDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'bomDetails';
}
