import { OrderExpenses, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { OrderExpenseSelection, OrderExpenseSelectionAll } from './prisma/order-expense.select';

export class OrderExpenseRepo extends BaseRepo<
    OrderExpenses,
    Prisma.OrderExpensesSelect,
    Prisma.OrderExpensesWhereInput
> {
    protected db = DatabaseAdapter.getInstance().orderExpenses;
    protected defaultSelect = OrderExpenseSelection;
    protected detailSelect = OrderExpenseSelectionAll;
    protected timeFieldDefault: string = 'time_at';
    protected modelKey: keyof Prisma.TransactionClient = 'orderExpenses';
}
