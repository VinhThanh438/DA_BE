import { Prisma } from '.prisma/client';
import { BankSelectionAll } from './bank.select';
import { EmployeeSelection } from './employee.select';
import { PartnerSelection } from './partner.select';
import { RepresentativeSelection } from './representative.select';
import { OrganizationSelection, OrderSelection, InvoiceSelection } from './base.select';

export const TransactionSelect: Prisma.TransactionsSelect = {
    id: true,
    type: true,
    time_at: true,
    order_type: true,
    amount: true,
    note: true,
    is_closed: true,
    partner_id: true,
    order_id: true,
    invoice_id: true,
};

export const TransactionSelectAll: Prisma.TransactionsSelect = {
    ...TransactionSelect,
    bank: {
        select: BankSelectionAll,
    },
    partner: {
        select: PartnerSelection,
    },
    employee: {
        select: EmployeeSelection,
    },
    organization: {
        select: OrganizationSelection,
    },
    order: {
        select: OrderSelection,
    },
    invoice: {
        select: InvoiceSelection,
    },
    representative: {
        select: RepresentativeSelection,
    },
};

export const TransactionSelectWithBankOrder: Prisma.TransactionsSelect = {
    ...TransactionSelect,
    bank: {
        select: BankSelectionAll,
    },
    partner: {
        select: PartnerSelection,
    },
    organization: {
        select: OrganizationSelection,
    },
    order: {
        select: OrderSelection,
    },
    payment: {
        select: {
            id: true,
            type: true,
        },
    },
    invoice: {
        select: InvoiceSelection,
    },
};
