import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { SearchField } from '@common/interfaces/common.interface';
import { ProductionStep, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { ProductionStepSelection, ProductionStepSelectionAll } from './prisma/prisma.select';

export class ProductionStepRepo extends BaseRepo<
    ProductionStep,
    Prisma.ProductionStepSelect,
    Prisma.ProductionStepWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().productionStep;
    protected defaultSelect = ProductionStepSelection;
    protected detailSelect = ProductionStepSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'productionStep';
    protected timeFieldDefault: string = 'created_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [],
    };
}
