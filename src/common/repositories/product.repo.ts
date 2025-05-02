import { Prisma, Products } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { ProductGroupSelection } from './product-group.repo';
import { UnitSelection } from './unit.repo';
export const ProductSelection: Prisma.ProductsSelect = {
    id: true,
    name: true,
    code: true,
    vat: true,
    image: true,
    packing_standard: true,
    note: true,
};
export const ProductSelectionAll: Prisma.ProductsSelect = {
    ...ProductSelection,
    product_group: { select: ProductGroupSelection },
    unit: { select: UnitSelection },
    extra_units: { select: { unit: { select: { ...UnitSelection, id: true } }, conversion_rate: true } },
};

export class ProductRepo extends BaseRepo<Products, Prisma.ProductsSelect, Prisma.ProductsWhereInput> {
    protected db = DatabaseAdapter.getInstance().products;
    protected defaultSelect = ProductSelection;
    protected detailSelect = ProductSelectionAll;
    protected modelKey = 'products' as const;
}
