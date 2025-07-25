import { InventoryDetails, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { InventoryDetailSelection, InventoryDetailSelectionAll } from './prisma/prisma.select';

export class InventoryDetailRepo extends BaseRepo<
    InventoryDetails,
    Prisma.InventoryDetailsSelect,
    Prisma.InventoryDetailsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().inventoryDetails;
    protected defaultSelect = InventoryDetailSelection;
    protected detailSelect = InventoryDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'inventoryDetails';
}
