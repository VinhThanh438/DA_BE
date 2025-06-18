import { Prisma } from '.prisma/client';
import { ProductGroupSelectionAll } from './product-group.select';
import { UnitSelection } from './unit.select';
import { ProductHistorySelection } from './base.select';

export const ProductSelection: Prisma.ProductsSelect = {
    id: true,
    name: true,
    code: true,
    current_price: true,
    vat: true,
    image: true,
    packing_standard: true,
    note: true,
    type: true,
    parent_id: true,
};

export const ProductSelectionAll: Prisma.ProductsSelect = {
    ...ProductSelection,
    product_group: {
        select: ProductGroupSelectionAll,
    },
    unit: {
        select: UnitSelection,
    },
    extra_units: {
        select: {
            unit: {
                select: UnitSelection,
            },
            conversion_rate: true,
        },
    },
    parent: {
        select: ProductSelection,
    },
    product_histories: {
        select: ProductHistorySelection,
    },
};
