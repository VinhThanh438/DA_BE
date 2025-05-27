import { Prisma } from '.prisma/client';
import { CommonDetailSelectionAll } from './common-detail.select';

export const InventoryDetailSelection: Prisma.InventoryDetailsSelect = {
    id: true,
    real_quantity: true,
    quantity: true,
    price: true,
    discount: true,
    vat: true,
    note: true,
    commission: true,
    order_detail_id: true,
};

export const InventoryDetailSelectionAll: Prisma.InventoryDetailsSelect = {
    ...InventoryDetailSelection,
    order_detail: {
        select: CommonDetailSelectionAll,
    },
};
