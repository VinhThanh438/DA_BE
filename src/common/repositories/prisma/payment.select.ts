import { Prisma } from '.prisma/client';
import { PaymentRequestSelect } from './payment-request.select';
import { OrderSelectionPartner } from './order.select';
import { InvoiceSelection } from './invoice.select';

export const PaymentSelect: Prisma.PaymentsSelect = {
    id: true,
    time_at: true,
    code: true,
    payment_date: true,
    note: true,
    type: true,
    files: true,
    status: true,
    rejected_reason: true,
    payment_request_id: true,
};

export const PaymentSelectAll: Prisma.PaymentsSelect = {
    ...PaymentSelect,
    payment_request: {
        select: PaymentRequestSelect
    },
    order: {
        select: OrderSelectionPartner
    },
    invoice: {
        select: InvoiceSelection
    }
};