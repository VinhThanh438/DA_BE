import { Positions, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { PositionSelection, PositionSelectionAll } from './prisma/prisma.select';

export class PositionRepo extends BaseRepo<Positions, Prisma.PositionsSelect, Prisma.PositionsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().positions;
    protected defaultSelect = PositionSelection;
    protected detailSelect = PositionSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'positions';
}
