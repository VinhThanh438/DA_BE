import { Inventories, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { InventorySelection, InventorySelectionAll } from './prisma/inventory.select';

export class InventoryRepo extends BaseRepo<Inventories, Prisma.InventoriesSelect, Prisma.InventoriesWhereInput> {
    protected db = DatabaseAdapter.getInstance().inventories;
    protected defaultSelect = InventorySelection;
    protected detailSelect = InventorySelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'inventories';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields = ['code'];
}
