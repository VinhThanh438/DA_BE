import { UnloadingCosts, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { UnloadingCostSelection, UnloadingCostSelectionAll } from './prisma/prisma.select';

export class UnloadingCostRepo extends BaseRepo<
    UnloadingCosts,
    Prisma.UnloadingCostsSelect,
    Prisma.UnloadingCostsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().unloadingCosts;
    protected defaultSelect = UnloadingCostSelection;
    protected detailSelect = UnloadingCostSelectionAll;
    protected modelKey = 'unloadingCosts' as const;
}
