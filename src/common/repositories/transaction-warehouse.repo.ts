import { Prisma, TransactionWarehouses } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { TransactionWarehouseSelect, TransactionWarehouseSelectAll } from './prisma/transaction-warehouse.select';

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
