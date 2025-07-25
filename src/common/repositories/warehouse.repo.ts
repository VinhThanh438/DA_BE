import { Warehouses, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { SearchField } from '@common/interfaces/common.interface';
import { WarehouseSelection, WarehouseSelectionAll } from './prisma/prisma.select';

export class WarehouseRepo extends BaseRepo<Warehouses, Prisma.WarehousesSelect, Prisma.WarehousesWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().warehouses;
    protected defaultSelect = WarehouseSelection;
    protected detailSelect = WarehouseSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'warehouses';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['name'] }, { path: ['code'] }, { path: ['note'] }, { path: ['phone'] }],
    };
}
