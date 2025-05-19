import { Prisma } from '.prisma/client';
import { ProductSelectionAll } from './product.select';
import { UnitSelectionAll } from './unit.select';

export const PurchaseRequestDetailSelection: Prisma.PurchaseRequestDetailsSelect = {
    id: true,
    quantity: true,
    note: true,
    unit_id: true,
    material_id: true,
};

export const PurchaseRequestDetailSelectionAll: Prisma.PurchaseRequestDetailsSelect = {
    ...PurchaseRequestDetailSelection,
    material: {
        select: ProductSelectionAll,
    },
    unit: {
        select: UnitSelectionAll,
    },
};
