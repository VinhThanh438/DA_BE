import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { FacilityOrders, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { FacilityOrderSelection, FacilityOrderSelectionAll } from './prisma/prisma.select';

export class FacilityOrderRepo extends BaseRepo<
    FacilityOrders,
    Prisma.FacilityOrdersSelect,
    Prisma.FacilityOrdersWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().facilityOrders;
    protected defaultSelect = FacilityOrderSelection;
    protected detailSelect = FacilityOrderSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'facilityOrders';
    protected timeFieldDefault: string = 'created_at';
}
