import { Prisma, TransactionWarehouses } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
export const TransactionWarehouseSelect: Prisma.TransactionWarehousesSelect = {
    quantity: true,
};
export const TransactionWarehouseSelectAll: Prisma.TransactionWarehousesSelect = {
    ...TransactionWarehouseSelect,
};
export class TransactionWarehouseRepo extends BaseRepo<
    TransactionWarehouses,
    Prisma.TransactionWarehousesSelect,
    Prisma.TransactionWarehousesWhereInput
> {
    protected db = DatabaseAdapter.getInstance();
    protected defaultSelect = TransactionWarehouseSelect;
    protected detailSelect = TransactionWarehouseSelectAll;
    protected modelKey = 'transactionWarehouses' as const;
}
