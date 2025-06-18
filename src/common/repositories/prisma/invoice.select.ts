import { Prisma } from '.prisma/client';
import { BankSelection } from './bank.select';
import { ContractSelection } from './contract.select';
import { EmployeeShortSelection } from './employee.select';
import { PartnerSelection } from './partner.select';
import { OrderSelectionPartner } from './order.select';
import { InvoiceDetailSelectionAll } from './invoice-detail.select';
import { InvoiceSelection } from './base.select';

export const InvoiceSelectionWithTotal: Prisma.InvoicesSelect = {
    ...InvoiceSelection,
    total_amount: true,
    total_money: true,
    total_vat: true,
    total_commission: true,

    total_amount_paid: true,
    total_amount_debt: true,
    total_commission_paid: true,
    total_commission_debt: true,
};

export const InvoiceSelectionAll: Prisma.InvoicesSelect = {
    ...InvoiceSelectionWithTotal,
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
        select: OrderSelectionPartner,
    },
};

export const InvoiceSelectionWithDetails: Prisma.InvoicesSelect = {
    ...InvoiceSelectionWithTotal,
    details: {
        select: InvoiceDetailSelectionAll,
    },
};
