import { Prisma, Products } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { ProductSelection, ProductSelectionAll } from './prisma/product.select';
import { SearchField } from '@common/interfaces/common.interface';

export class ProductRepo extends BaseRepo<Products, Prisma.ProductsSelect, Prisma.ProductsWhereInput> {
    protected db = DatabaseAdapter.getInstance().products;
    protected defaultSelect = ProductSelection;
    protected detailSelect = ProductSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'products';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['name'] }, { path: ['code'] }]
    };
}
