import { Prisma } from '.prisma/client';
import { BankSelectionAll } from './bank.select';
import { CommonDetailSelectionAll } from './common-detail.select';
import { ContractSelection } from './contract.select';
import { EmployeeShortSelection } from './employee.select';
import { InventorySelection } from './inventory.select';
import { InvoiceSelection } from './invoice.select';
import { OrderExpenseSelection } from './order-expense.select';
import { OrganizationSelection } from './organization.select';
import { PartnerSelectionAll } from './partner.select';
import { ProductionSelection } from './production.select';
import { RepresentativeShortSelectionAll } from './representative.select';

export const OrderSelection: Prisma.OrdersSelect = {
    id: true,
    code: true,
    time_at: true,
    type: true,
    address: true,
    phone: true,
    status: true,
    rejected_reason: true,
    files: true,
    note: true,
    organization: {
        select: OrganizationSelection,
    },
};

export const OrderSelectionAll: Prisma.OrdersSelect = {
    ...OrderSelection,
    representative: {
        select: RepresentativeShortSelectionAll,
    },
    partner: {
        select: PartnerSelectionAll,
    },
    details: {
        select: CommonDetailSelectionAll,
    },
    order_expenses: {
        select: OrderExpenseSelection,
    },
    productions: {
        select: ProductionSelection,
    },
    contracts: {
        select: ContractSelection,
    },
    invoices: {
        select: InvoiceSelection,
    },
    inventories: {
        select: InventorySelection,
    },
    employee: {
        select: EmployeeShortSelection,
    },
    bank: {
        select: BankSelectionAll,
    },
};

export const orderSelectionDetails: Prisma.OrdersSelect = {
    ...OrderSelection,
    details: {
        select: CommonDetailSelectionAll,
    },
};
