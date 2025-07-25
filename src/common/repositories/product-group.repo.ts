import { Prisma, ProductGroups } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { ProductGroupSelection, ProductGroupSelectionAll } from './prisma/prisma.select';

export class ProductGroupRepo extends BaseRepo<
    ProductGroups,
    Prisma.ProductGroupsSelect,
    Prisma.ProductGroupsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().productGroups;
    protected defaultSelect = ProductGroupSelection;
    protected detailSelect = ProductGroupSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'productGroups';
}
