import { ProductionDetails, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { ProductSelection } from './product.repo';
import { UnitSelectionAll } from './unit.repo';

export const ProductionDetailSelection: Prisma.ProductionDetailsSelect = {
    id: true,
    quantity: true,
    completion_date: true,
    note: true,
};

export const ProductionDetailSelectionAll: Prisma.ProductionDetailsSelect = {
    ...ProductionDetailSelection,
    product: {
        select: ProductSelection
    },
    unit: {
        select: UnitSelectionAll
    }
};

export class ProductionDetailRepo extends BaseRepo<
    ProductionDetails,
    Prisma.ProductionDetailsSelect,
    Prisma.ProductionDetailsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().productionDetails;
    protected defaultSelect = ProductionDetailSelection;
    protected detailSelect = ProductionDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'productionDetails';
}
