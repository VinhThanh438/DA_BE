import { BillOfMaterials, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { BillOfMaterialSelection, BillOfMaterialSelectionAll } from './prisma/bom.select';

export class BillOfMaterialRepo extends BaseRepo<
    BillOfMaterials,
    Prisma.BillOfMaterialsSelect,
    Prisma.BillOfMaterialsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().billOfMaterials;
    protected defaultSelect = BillOfMaterialSelection;
    protected detailSelect = BillOfMaterialSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'billOfMaterials';
}
