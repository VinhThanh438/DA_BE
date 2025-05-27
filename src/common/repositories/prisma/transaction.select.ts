import { Prisma } from '.prisma/client';
import { BankSelectionAll } from './bank.select';
import { EmployeeSelection } from './employee.select';
import { OrderSelection } from './order.select';
import { OrganizationSelection } from './organization.select';
import { PartnerSelection } from './partner.select';
import { RepresentativeSelection } from './representative.select';
import { InvoiceSelection } from './invoice.select';

export const TransactionSelect: Prisma.TransactionsSelect = {
    id: true,
    type: true,
    time_at: true,
    order_type: true,
    amount: true,
    note: true,
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
