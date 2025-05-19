import { Prisma } from '.prisma/client';

export const ProductGroupSelection: Prisma.ProductGroupsSelect = {
    id: true,
    name: true,
    type: true,
};
export const ProductGroupSelectionAll: Prisma.ProductGroupsSelect = {
    ...ProductGroupSelection,
};
