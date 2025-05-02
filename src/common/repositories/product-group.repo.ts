import { Prisma, ProductGroups } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
export const ProductGroupSelection: Prisma.ProductGroupsSelect = {
    id: true,
    name: true,
};
export const ProductGroupSelectionAll: Prisma.ProductGroupsSelect = {
    ...ProductGroupSelection,
};

export class ProductGroupRepo extends BaseRepo<
    ProductGroups,
    Prisma.ProductGroupsSelect,
    Prisma.ProductGroupsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().productGroups;
    protected defaultSelect = ProductGroupSelection;
    protected detailSelect = ProductGroupSelectionAll;
    protected modelKey = 'productGroups' as const;
}
