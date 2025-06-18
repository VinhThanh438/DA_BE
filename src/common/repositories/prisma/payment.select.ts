import { Prisma } from '.prisma/client';
import { OrderSelectionPartner } from './order.select';
import { PartnerSelection } from './partner.select';
import { BankSelection } from './bank.select';
import { PaymentRequestDetailSelection } from './payment-request-details.select';
import { TransactionSelect } from './transaction.select';
import { InvoiceSelection } from './base.select';

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

    bank_id: true,
    partner_id: true,
    organization_id: true,
    order_id: true,
    invoice_id: true,

    description: true,
    payment_method: true,
    amount: true,
    counterparty: true,
    attached_documents: true,
    transactions: {
        select: TransactionSelect,
    },
};

export const PaymentSelectAll: Prisma.PaymentsSelect = {
    ...PaymentSelect,
    payment_request_detail: {
        select: PaymentRequestDetailSelection,
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
