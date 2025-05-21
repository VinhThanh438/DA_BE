import { Prisma } from '.prisma/client';
import { ProductSelection } from './product.select';
import { UnitSelection } from './unit.select';

export const InventoryDetailSelection: Prisma.InventoryDetailsSelect = {
    id: true,
    real_quantity: true,
    quantity: true,
    price: true,
    discount: true,
    vat: true,
    note: true,
    commission: true,
};

export const InventoryDetailSelectionAll: Prisma.InventoryDetailsSelect = {
    ...InventoryDetailSelection,
    product: {
        select: ProductSelection
    },
    unit: {
        select: UnitSelection
    }
};
