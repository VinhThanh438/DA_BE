import { Prisma } from '.prisma/client';
import { CommonDetailSelectionAll } from './common-detail.select';
import { InventoryForGetImportDetailSelection } from './inventory.select';

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

export const InventoryDetailSelectionProduct: Prisma.InventoryDetailsSelect = {
    id: true,
    real_quantity: true,
    quantity: true,
    price: true,
    discount: true,
    vat: true,
    note: true,
    commission: true,
    order_detail_id: true,
    order_detail: {
        select: CommonDetailSelectionAll,
    },
};

export const InventoryDetailSelectionAll: Prisma.InventoryDetailsSelect = {
    ...InventoryDetailSelection,
    order_detail: {
        select: CommonDetailSelectionAll,
    },
};

export const InventoryDetailSelectionImportDetail: Prisma.InventoryDetailsSelect = {
    ...InventoryDetailSelection,
    order_detail: {
        select: CommonDetailSelectionAll,
    },
    inventory: {
        select: InventoryForGetImportDetailSelection,
    },
};
