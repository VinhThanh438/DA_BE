import { PurchaseRequestDetails, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { ProductSelectionAll } from './product.repo';

export const PurchaseRequestDetailSelection: Prisma.PurchaseRequestDetailsSelect = {
    id: true,
    quantity: true,
    note: true,
};

export const PurchaseRequestDetailSelectionAll: Prisma.PurchaseRequestDetailsSelect = {
    ...PurchaseRequestDetailSelection,
    product: {
        select: ProductSelectionAll,
    },
};

export class PurchaseRequestDetailRepo extends BaseRepo<
    PurchaseRequestDetails,
    Prisma.PurchaseRequestDetailsSelect,
    Prisma.PurchaseRequestDetailsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().purchaseRequestDetails;
    protected defaultSelect = PurchaseRequestDetailSelection;
    protected detailSelect = PurchaseRequestDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'purchaseRequestDetails';
}
