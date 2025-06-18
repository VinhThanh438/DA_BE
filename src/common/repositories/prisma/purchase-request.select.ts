import { Prisma } from '.prisma/client';
import { EmployeeShortSelection } from './employee.select';
import { ProductionSelection } from './production.select';
import { PurchaseRequestDetailSelectionAll } from './purchase-request-details.select';
import { OrderSelection } from './base.select';

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
        select: PurchaseRequestDetailSelectionAll,
    },
    order: {
        select: OrderSelection,
    },
    production: {
        select: ProductionSelection,
    },
};
