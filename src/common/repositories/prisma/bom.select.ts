import { Prisma } from '.prisma/client';
import { ProductSelectionAll } from './product.select';
import { BillOfMaterialDetailSelectionAll } from './bom-detail.select';

export const BillOfMaterialSelection: Prisma.BillOfMaterialsSelect = {
    id: true,
    salary: true,
};

export const BillOfMaterialSelectionAll: Prisma.BillOfMaterialsSelect = {
    ...BillOfMaterialSelection,
    product: {
        select: ProductSelectionAll,
    },
    details: {
        select: BillOfMaterialDetailSelectionAll,
    },
};
