import { PurchaseRequests, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EmployeeShortSelection } from './employee.repo';
import { PurchaseRequestDetailSelectionAll } from './purchase-request-details.repo';
import { OrderSelection } from './order.repo';
import { ProductionSelection } from './production.repo';

export const PurchaseRequestSelection: Prisma.PurchaseRequestsSelect = {
    id: true,
    code: true,
    note: true,
    status: true,
    files: true,
    rejected_reason: true,
    time_at: true,
};

export const PurchaseRequestSelectionAll: Prisma.PurchaseRequestsSelect = {
    ...PurchaseRequestSelection,
    employee: {
        select: EmployeeShortSelection,
    },
    details: {
        select: PurchaseRequestDetailSelectionAll
    },
    order: {
        select: OrderSelection
    },
    production: {
        select: ProductionSelection
    }
};

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
