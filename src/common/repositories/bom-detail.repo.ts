import { BillOfMaterialDetails, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { ProductSelectionAll } from './product.repo';
import { UnitSelectionAll } from './unit.repo';

export const BillOfMaterialDetailSelection: Prisma.BillOfMaterialDetailsSelect = {
    id: true,
    quantity: true
};

export const BillOfMaterialDetailSelectionAll: Prisma.BillOfMaterialDetailsSelect = {
    ...BillOfMaterialDetailSelection,
    material: {
        select: ProductSelectionAll
    },
    unit: {
        select: UnitSelectionAll
    }
};

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
