import { BillOfMaterialDetails, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { BillOfMaterialDetailSelection, BillOfMaterialDetailSelectionAll } from './prisma/bom-detail.select';

export class BillOfMaterialDetailRepo extends BaseRepo<
    BillOfMaterialDetails,
    Prisma.BillOfMaterialDetailsSelect,
    Prisma.BillOfMaterialDetailsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().billOfMaterialDetails;
    protected defaultSelect = BillOfMaterialDetailSelection;
    protected detailSelect = BillOfMaterialDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'billOfMaterialDetails';
}
