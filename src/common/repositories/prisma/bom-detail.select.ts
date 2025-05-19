import { Prisma } from '.prisma/client';
import { ProductSelectionAll } from './product.select';
import { UnitSelectionAll } from './unit.select';

export const BillOfMaterialDetailSelection: Prisma.BillOfMaterialDetailsSelect = {
    id: true,
    quantity: true,
};

export const BillOfMaterialDetailSelectionAll: Prisma.BillOfMaterialDetailsSelect = {
    ...BillOfMaterialDetailSelection,
    material: {
        select: ProductSelectionAll,
    },
    unit: {
        select: UnitSelectionAll,
    },
};
