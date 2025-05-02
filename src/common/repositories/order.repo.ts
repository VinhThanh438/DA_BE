import { Orders, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { PartnerSelection } from './partner.repo';
import { CommonDetailSelectionAll } from './common-detail.repo';
import { OrderExpenseSelection } from './order-expense.repo';
import { ProductionSelectionAll } from './production.repo';
import { ContractSelection } from './contract.repo';
import { InvoiceSelection } from './invoice.repo';

export const OrderSelection: Prisma.OrdersSelect = {
    id: true,
    code: true,
    order_date: true,
    type: true,
    address: true,
    phone: true,
    files: true,
};

export const OrderSelectionAll: Prisma.OrdersSelect = {
    ...OrderSelection,
    partner: {
        select: PartnerSelection,
    },
    order_details: {
        select: CommonDetailSelectionAll,
    },
    order_expenses: {
        select: OrderExpenseSelection,
    },
    productions: {
        select: ProductionSelectionAll,
    },
    contracts: {
        select: ContractSelection,
    },
    invoices: {
        select: InvoiceSelection,
    }
};

export class OrderRepo extends BaseRepo<Orders, Prisma.OrdersSelect, Prisma.OrdersWhereInput> {
    protected db = DatabaseAdapter.getInstance().orders;
    protected defaultSelect = OrderSelection;
    protected detailSelect = OrderSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'orders';
}
