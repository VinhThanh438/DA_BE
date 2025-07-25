import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { SearchField } from '@common/interfaces/common.interface';
import { Facility, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { FacilitySelection, FacilitySelectionAll } from './prisma/prisma.select';

export class FacilityRepo extends BaseRepo<Facility, Prisma.FacilitySelect, Prisma.FacilityWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().facility;
    protected defaultSelect = FacilitySelection;
    protected detailSelect = FacilitySelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'facility';
    protected timeFieldDefault: string = 'created_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['name'] }, { path: ['code'] }],
    };
}
