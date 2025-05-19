import { Prisma } from '.prisma/client';
import { PartnerSelection } from './partner.select';
import { ProductionDetailSelectionAll } from './production-detail.select';

export const ProductionSelection: Prisma.ProductionsSelect = {
    id: true,
    code: true,
    time_at: true,
    files: true,
};

export const ProductionSelectionAll: Prisma.ProductionsSelect = {
    ...ProductionSelection,
    partner: {
        select: PartnerSelection,
    },
    details: {
        select: ProductionDetailSelectionAll,
    },
};
