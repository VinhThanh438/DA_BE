import { WorkPricings, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { WorkPricingSelection, WorkPricingSelectionAll } from './prisma/prisma.select';

export class WorkPricingRepo extends BaseRepo<WorkPricings, Prisma.WorkPricingsSelect, Prisma.WorkPricingsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().workPricings;
    protected defaultSelect = WorkPricingSelection;
    protected detailSelect = WorkPricingSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'workPricings';
}
