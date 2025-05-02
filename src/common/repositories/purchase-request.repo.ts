import { PurchaseRequests, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EmployeeShortSelection } from './employee.repo';

export const PurchaseRequestSelection: Prisma.PurchaseRequestsSelect = {
    id: true,
    code: true,
    note: true,
    status: true,
    files: true,
};

export const PurchaseRequestSelectionAll: Prisma.PurchaseRequestsSelect = {
    ...PurchaseRequestSelection,
    employee: {
        select: EmployeeShortSelection,
    },
};

export class PurchaseRequestRepo extends BaseRepo<
    PurchaseRequests,
    Prisma.PurchaseRequestsSelect,
    Prisma.PurchaseRequestsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().purchaseRequests;
    protected defaultSelect = PurchaseRequestSelection;
    protected detailSelect = PurchaseRequestSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'purchaseRequests';
}
