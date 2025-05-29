import { Prisma } from '.prisma/client';
import { WarehouseSelectionAll } from './warehouse.select';
import { InventorySelectionDetails } from './inventory.select';

export const TransactionWarehouseSelect: Prisma.TransactionWarehousesSelect = {
    id: true,
    quantity: true,
    time_at: true,
    type: true,
    note: true,
    convert_quantity: true,
    real_quantity: true
};

export const TransactionWarehouseSelectAll: Prisma.TransactionWarehousesSelect = {
    ...TransactionWarehouseSelect,
    warehouse: {
        select: WarehouseSelectionAll,
    },
    inventory: {
        select: InventorySelectionDetails,
    },
};
