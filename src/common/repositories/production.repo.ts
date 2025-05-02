import { Productions, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { PartnerSelection } from './partner.repo';
import { ProductionDetailSelectionAll } from './production-detail.repo';

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
    production_details: {
        select: ProductionDetailSelectionAll
    }
};

export class ProductionRepo extends BaseRepo<Productions, Prisma.ProductionsSelect, Prisma.ProductionsWhereInput> {
    protected db = DatabaseAdapter.getInstance().productions;
    protected defaultSelect = ProductionSelection;
    protected detailSelect = ProductionSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'productions';
}
