import { Prisma } from '.prisma/client';
import { ProductSelectionAll } from './product.select';
import { UnitSelectionAll } from './unit.select';

export const CommonDetailSelection: Prisma.CommonDetailsSelect = {
    id: true,
    quantity: true,
    price: true,
    discount: true,
    vat: true,
    note: true,
    commission: true,
    imported_quantity: true,
    product_id: true,
    unit_id: true,
};

export const CommonDetailSelectionAll: Prisma.CommonDetailsSelect = {
    ...CommonDetailSelection,
    product: {
        select: ProductSelectionAll,
    },
    unit: {
        select: UnitSelectionAll,
    },
};
