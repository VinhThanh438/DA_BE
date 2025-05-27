import { Prisma } from '.prisma/client';
import { BankSelectionAll } from './bank.select';
import { CommonDetailSelectionAll } from './common-detail.select';
import { ContractSelection } from './contract.select';
import { EmployeeShortSelection } from './employee.select';
import { InventorySelection } from './inventory.select';
import { OrderExpenseSelection } from './order-expense.select';
import { OrganizationSelection } from './organization.select';
import { PartnerSelection, PartnerSelectionAll } from './partner.select';
import { ProductionSelection } from './production.select';
import { RepresentativeShortSelectionAll } from './representative.select';
import { ShippingPlanSelectionAll } from './shipping-plan.select';
import { InvoiceSelection } from './invoice.select';

export const OrderSelection: Prisma.OrdersSelect = {
    id: true,
    code: true,
    time_at: true,
    type: true,
    address: true,
    phone: true,
    status: true,
    payment_method: true,
    rejected_reason: true,
    files: true,
    note: true,
    partner_id: true,
    employee_id: true,
    organization: {
        select: OrganizationSelection,
    },
    delivery_progress: true,
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
    inventories: {
        select: InventorySelection,
    },
    invoices: {
        select: InvoiceSelection,
    },
    employee: {
        select: EmployeeShortSelection,
    },
    bank: {
        select: BankSelectionAll,
    },
    shipping_plans: {
        select: ShippingPlanSelectionAll,
    },
};

export const OrderSelectionDetails: Prisma.OrdersSelect = {
    ...OrderSelection,
    details: {
        select: CommonDetailSelectionAll,
    },
};

export const OrderSelectionPartner: Prisma.OrdersSelect = {
    ...OrderSelection,
    partner: {
        select: PartnerSelection,
    },
};
