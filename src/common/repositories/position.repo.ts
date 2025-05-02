import { Positions, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';

export const PositionSelection: Prisma.PositionsSelect = {
    id: true,
    name: true,
    level: true,
    description: true
};

export const PositionSelectionAll: Prisma.PositionsSelect = {
    ...PositionSelection,
};

export class PositionRepo extends BaseRepo<Positions, Prisma.PositionsSelect, Prisma.PositionsWhereInput> {
    protected db = DatabaseAdapter.getInstance().positions;
    protected defaultSelect = PositionSelection;
    protected detailSelect = PositionSelectionAll;
    protected modelKey = 'positions' as const;
}
