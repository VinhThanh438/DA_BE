import { Prisma } from '.prisma/client';
import { BankSelection } from './bank.select';
import { ContractSelection } from './contract.select';
import { EmployeeShortSelection } from './employee.select';
import { PartnerSelection } from './partner.select';
import { OrderSelection } from './order.select';
import { InvoiceDetailSelectionAll } from './invoice-detail.select';

export const InvoiceSelection: Prisma.InvoicesSelect = {
    id: true,
    code: true,
    time_at: true,
    invoice_date: true,
    status: true,
    rejected_reason: true,
    note: true,
    files: true,
};

export const InvoiceSelectionAll: Prisma.InvoicesSelect = {
    ...InvoiceSelection,
    details: {
        select: InvoiceDetailSelectionAll,
    },
    bank: {
        select: BankSelection,
    },
    contract: {
        select: ContractSelection,
    },
    employee: {
        select: EmployeeShortSelection,
    },
    partner: {
        select: PartnerSelection,
    },
    order: {
        select: OrderSelection,
    },
};

export const InvoiceSelectionWithDetails: Prisma.InvoicesSelect = {
    ...InvoiceSelection,
    details: {
        select: InvoiceDetailSelectionAll,
    },
};
