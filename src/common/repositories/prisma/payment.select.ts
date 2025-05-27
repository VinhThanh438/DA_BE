import { Prisma } from '.prisma/client';
import { PaymentRequestSelect } from './payment-request.select';
import { OrderSelectionPartner } from './order.select';
import { InvoiceSelection } from './invoice.select';
import { PartnerSelection } from './partner.select';
import { BankSelection } from './bank.select';

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
    bank_id: true,
    partner_id: true,

    description: true,
    payment_method: true,
    amount: true,
    counterparty: true,
    attached_documents: true,
};

export const PaymentSelectAll: Prisma.PaymentsSelect = {
    ...PaymentSelect,
    payment_request: {
        select: PaymentRequestSelect,
    },
    order: {
        select: OrderSelectionPartner,
    },
    invoice: {
        select: InvoiceSelection,
    },
    partner: {
        select: PartnerSelection,
    },
    bank: {
        select: BankSelection,
    },
};
