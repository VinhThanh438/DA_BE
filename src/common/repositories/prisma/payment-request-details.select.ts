import { Prisma } from '.prisma/client';
import { OrderSelectionDetails } from './order.select';
import { InvoiceSelection } from './invoice.select';

export const PaymentRequestDetailSelection: Prisma.PaymentRequestDetailsSelect = {
    id: true,
    amount: true,
    note: true,
    order_id: true,
    invoice_id: true,
};
export const PaymentRequestDetailSelectionAll: Prisma.PaymentRequestDetailsSelect = {
    ...PaymentRequestDetailSelection,
    order: {
        select: OrderSelectionDetails,
    },
    invoice: {
        select: InvoiceSelection,
    },
};
