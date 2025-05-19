import { Prisma } from '.prisma/client';
import { PaymentRequestDetailSelectionAll } from './payment-request-details.select';

export const PaymentRequestSelect: Prisma.PaymentRequestsSelect = {
    id: true,
    time_at: true,
    code: true,
    payment_date: true,
    note: true,
    type: true,
    files: true,
    status: true,
    rejected_reason: true,
};
export const PaymentRequestSelectAll: Prisma.PaymentRequestsSelect = {
    ...PaymentRequestSelect,
    details: {
        select: PaymentRequestDetailSelectionAll,
    },
};
