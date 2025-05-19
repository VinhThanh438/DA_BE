import { ProductionDetails, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { ProductionDetailSelection, ProductionDetailSelectionAll } from './prisma/production-detail.select';

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
