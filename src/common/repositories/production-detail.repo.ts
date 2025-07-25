import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { ProductionDetails, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { ProductionDetailSelection, ProductionDetailSelectionAll } from './prisma/prisma.select';

export class ProductionDetailRepo extends BaseRepo<
    ProductionDetails,
    Prisma.ProductionDetailsSelect,
    Prisma.ProductionDetailsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().productionDetails;
    protected defaultSelect = ProductionDetailSelection;
    protected detailSelect = ProductionDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'productionDetails';
}
