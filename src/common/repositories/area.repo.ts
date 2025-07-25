import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { SearchField } from '@common/interfaces/common.interface';
import { Areas, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { AreasSelection, AreasSelectionAll } from './prisma/prisma.select';

export class AreaRepo extends BaseRepo<Areas, Prisma.AreasSelect, Prisma.AreasWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().areas;
    protected defaultSelect = AreasSelection;
    protected detailSelect = AreasSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'areas';
    protected timeFieldDefault: string = 'created_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [],
    };
}
