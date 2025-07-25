import { PurchaseRequestDetails, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { PurchaseRequestDetailSelection, PurchaseRequestDetailSelectionAll } from './prisma/prisma.select';

export class PurchaseRequestDetailRepo extends BaseRepo<
    PurchaseRequestDetails,
    Prisma.PurchaseRequestDetailsSelect,
    Prisma.PurchaseRequestDetailsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().purchaseRequestDetails;
    protected defaultSelect = PurchaseRequestDetailSelection;
    protected detailSelect = PurchaseRequestDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'purchaseRequestDetails';
}
