import { Prisma, ProductHistories } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { ProductHistorySelection } from './prisma/base.select';
import { ProductHistorySelectionAll } from './prisma/product-history.select';

export class ProductHistorieRepo extends BaseRepo<
    ProductHistories,
    Prisma.ProductHistoriesSelect,
    Prisma.ProductHistoriesWhereInput
> {
    protected db = DatabaseAdapter.getInstance().productHistories;
    protected defaultSelect = ProductHistorySelection;
    protected detailSelect = ProductHistorySelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'productHistories';
}
