import { Orders, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { OrderSelection, OrderSelectionAll } from './prisma/order.select';

export class OrderRepo extends BaseRepo<Orders, Prisma.OrdersSelect, Prisma.OrdersWhereInput> {
    protected db = DatabaseAdapter.getInstance().orders;
    protected defaultSelect = OrderSelection;
    protected detailSelect = OrderSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'orders';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields = ['code', 'phone'];
}
