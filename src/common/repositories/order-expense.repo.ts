import { OrderExpenses, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';

export const OrderExpenseSelection: Prisma.OrderExpensesSelect = {
    id: true,
    code: true,
    time_at: true,
    description: true,
    payment_method: true,
    amount: true,
    transaction_person: true,
    address: true,
    attached_documents: true,
    type: true,
    files: true,
};

export const OrderExpenseSelectionAll: Prisma.OrderExpensesSelect = {
    ...OrderExpenseSelection,
};

export class OrderExpenseRepo extends BaseRepo<OrderExpenses, Prisma.OrderExpensesSelect, Prisma.OrderExpensesWhereInput> {
    protected db = DatabaseAdapter.getInstance().orderExpenses;
    protected defaultSelect = OrderExpenseSelection;
    protected detailSelect = OrderExpenseSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'orderExpenses';
}
