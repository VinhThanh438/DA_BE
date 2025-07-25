import { Prisma, TransactionWarehouses } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { TransactionWarehouseSelect, TransactionWarehouseSelectAll } from './prisma/prisma.select';

export class TransactionWarehouseRepo extends BaseRepo<
    TransactionWarehouses,
    Prisma.TransactionWarehousesSelect,
    Prisma.TransactionWarehousesWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().transactionWarehouses;
    protected defaultSelect = TransactionWarehouseSelect;
    protected detailSelect = TransactionWarehouseSelectAll;
    protected modelKey: keyof Prisma.TransactionClient = 'transactionWarehouses';
}
