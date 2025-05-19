import { PurchaseRequests, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { PurchaseRequestSelection, PurchaseRequestSelectionAll } from './prisma/purchase-request.select';

export class PurchaseRequestRepo extends BaseRepo<
    PurchaseRequests,
    Prisma.PurchaseRequestsSelect,
    Prisma.PurchaseRequestsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().purchaseRequests;
    protected defaultSelect = PurchaseRequestSelection;
    protected detailSelect = PurchaseRequestSelectionAll;
    protected timeFieldDefault: string = 'time_at';
    protected modelKey: keyof Prisma.TransactionClient = 'purchaseRequests';
}
