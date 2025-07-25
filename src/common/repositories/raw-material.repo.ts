import { RawMaterialSelection, RawMaterialSelectionAll } from './prisma/prisma.select';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { SearchField } from '@common/interfaces/common.interface';
import { RawMaterials, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';

export class RawMaterialRepo extends BaseRepo<RawMaterials, Prisma.RawMaterialsSelect, Prisma.RawMaterialsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().rawMaterials;
    protected defaultSelect = RawMaterialSelection;
    protected detailSelect = RawMaterialSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'rawMaterials';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [],
    };
}
