import { Prisma } from '.prisma/client';
import { ProductSelection } from './product.select';
import { ProductHistorySelection } from './base.select';

export const ProductHistorySelectionAll: Prisma.ProductHistoriesSelect = {
    ...ProductHistorySelection,
    product: {
        select: ProductSelection,
    },
};
