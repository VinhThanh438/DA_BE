import { Prisma, ProductHistories } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { ProductHistorySelection, ProductHistorySelectionAll } from './prisma/prisma.select';

export class ProductHistoryRepo extends BaseRepo<
    ProductHistories,
    Prisma.ProductHistoriesSelect,
    Prisma.ProductHistoriesWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().productHistories;
    protected defaultSelect = ProductHistorySelection;
    protected detailSelect = ProductHistorySelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'productHistories';
}
