import { Productions, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { ProductionSelection, ProductionSelectionAll } from './prisma/production.select';
import { SearchField } from '@common/interfaces/common.interface';

export class ProductionRepo extends BaseRepo<Productions, Prisma.ProductionsSelect, Prisma.ProductionsWhereInput> {
    protected db = DatabaseAdapter.getInstance().productions;
    protected defaultSelect = ProductionSelection;
    protected detailSelect = ProductionSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'productions';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['code'] },]
    };
}
