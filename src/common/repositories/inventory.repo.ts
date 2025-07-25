import { Inventories, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { SearchField } from '@common/interfaces/common.interface';
import { InventorySelection, InventorySelectionAll } from './prisma/prisma.select';

export class InventoryRepo extends BaseRepo<Inventories, Prisma.InventoriesSelect, Prisma.InventoriesWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().inventories;
    protected defaultSelect = InventorySelection;
    protected detailSelect = InventorySelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'inventories';
    protected timeFieldDefault: string = 'time_at';
    // protected searchableFields = ['code'];
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [
            { path: ['code'] },
            { path: ['order', 'code'] },
            // { path: ['order_details', 'po'], isArray: true },
        ],
    };
}
