import { Prisma } from '.prisma/client';

export const TransactionWarehouseSelect: Prisma.TransactionWarehousesSelect = {
    quantity: true,
};

export const TransactionWarehouseSelectAll: Prisma.TransactionWarehousesSelect = {
    ...TransactionWarehouseSelect,
};
