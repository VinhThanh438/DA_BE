import { Prisma, StockTrackings } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { StockTrackingSelection, StockTrackingSelectionAll } from './prisma/prisma.select';

export class StockTrackingRepo extends BaseRepo<
    StockTrackings,
    Prisma.StockTrackingsSelect,
    Prisma.StockTrackingsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().stockTrackings;
    protected defaultSelect = StockTrackingSelection;
    protected detailSelect = StockTrackingSelectionAll;
    protected modelKey = 'stockTrackings' as const;
}
