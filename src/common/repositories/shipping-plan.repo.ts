import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { ShippingPlans, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { ShippingPlanSelection, ShippingPlanSelectionAll } from './prisma/prisma.select';

export class ShippingPlanRepo extends BaseRepo<
    ShippingPlans,
    Prisma.ShippingPlansSelect,
    Prisma.ShippingPlansWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().shippingPlans;
    protected defaultSelect = ShippingPlanSelection;
    protected detailSelect = ShippingPlanSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'shippingPlans';
}
