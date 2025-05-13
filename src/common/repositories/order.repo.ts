import { Orders, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { PartnerSelection } from './partner.repo';
import { CommonDetailSelectionAll } from './common-detail.repo';
import { OrderExpenseSelection } from './order-expense.repo';
import { ProductionSelection } from './production.repo';
import { ContractSelection } from './contract.repo';
import { InvoiceSelection } from './invoice.repo';
import { InventorySelection } from './inventory.repo';
import { EmployeeSelection } from './employee.repo';
import { RepresentativeSelection } from './representative.repo';

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
};

export const OrderSelectionAll: Prisma.OrdersSelect = {
    ...OrderSelection,
    partner: {
        select: PartnerSelection,
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
        select: InventorySelection
    },
    employee: {
        select: EmployeeSelection
    },
    representative: {
        select: RepresentativeSelection
    }
};

export const orderSelectionDetails: Prisma.OrdersSelect = {
    ...OrderSelection,
    details: {
        select: CommonDetailSelectionAll,
    },
};

export class OrderRepo extends BaseRepo<Orders, Prisma.OrdersSelect, Prisma.OrdersWhereInput> {
    protected db = DatabaseAdapter.getInstance().orders;
    protected defaultSelect = OrderSelection;
    protected detailSelect = OrderSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'orders';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields = ['code', 'phone'];
}
