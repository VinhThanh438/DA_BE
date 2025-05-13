import { BillOfMaterials, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { ProductSelectionAll } from './product.repo';
import { BillOfMaterialDetailSelectionAll } from './bom-detail.repo';

export const BillOfMaterialSelection: Prisma.BillOfMaterialsSelect = {
    id: true,
    salary: true
};

export const BillOfMaterialSelectionAll: Prisma.BillOfMaterialsSelect = {
    ...BillOfMaterialSelection,
    product: {
        select: ProductSelectionAll
    },
    details: {
        select: BillOfMaterialDetailSelectionAll
    }
};

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
