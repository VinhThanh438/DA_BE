import { Prisma, Units } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
export const UnitSelection: Prisma.UnitsSelect = {
    id: true,
    name: true,
};
export const UnitSelectionAll: Prisma.UnitsSelect = {
    ...UnitSelection,
};

export class UnitRepo extends BaseRepo<Units, Prisma.UnitsSelect, Prisma.UnitsWhereInput> {
    protected db = DatabaseAdapter.getInstance().units;
    protected defaultSelect = UnitSelection;
    protected detailSelect = UnitSelectionAll;
    protected modelKey = 'units' as const;
}
