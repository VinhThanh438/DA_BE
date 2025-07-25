import { Prisma, Units } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { UnitSelection, UnitSelectionAll } from './prisma/prisma.select';

export class UnitRepo extends BaseRepo<Units, Prisma.UnitsSelect, Prisma.UnitsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().units;
    protected defaultSelect = UnitSelection;
    protected detailSelect = UnitSelectionAll;
    protected modelKey = 'units' as const;
}
