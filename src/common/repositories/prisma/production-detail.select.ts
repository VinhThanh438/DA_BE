import { Prisma } from '.prisma/client';
import { ProductSelection } from './product.select';
import { UnitSelectionAll } from './unit.select';

export const ProductionDetailSelection: Prisma.ProductionDetailsSelect = {
    id: true,
    quantity: true,
    completion_date: true,
    note: true,
};

export const ProductionDetailSelectionAll: Prisma.ProductionDetailsSelect = {
    ...ProductionDetailSelection,
    product: {
        select: ProductSelection,
    },
    unit: {
        select: UnitSelectionAll,
    },
};
