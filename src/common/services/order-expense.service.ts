import { OrderExpenseRepo } from '@common/repositories/order-expense.repo';
import { BaseService } from './base.service';
import { OrderExpenses, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { IOrderExpense } from '@common/interfaces/order-expense.interface';
import { APIError } from '@common/error/api.error';
import { ErrorCode } from '@common/errors';
import { OrderRepo } from '@common/repositories/order.repo';

export class OrderExpenseService extends BaseService<
    OrderExpenses,
    Prisma.OrderExpensesSelect,
    Prisma.OrderExpensesWhereInput
> {
    private static instance: OrderExpenseService;
    private orderRepo: OrderRepo = new OrderRepo();

    private constructor() {
        super(new OrderExpenseRepo());
    }

    public static getInstance(): OrderExpenseService {
        if (!this.instance) {
            this.instance = new OrderExpenseService();
        }
        return this.instance;
    }

    public async createOrderExpense(data: Partial<IOrderExpense>, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        const existed = await this.repo.findOne({ code: data.code, type: data.type }, false, tx);

        if (existed) {
            throw new APIError({
                message: 'common.existed',
                status: ErrorCode.BAD_REQUEST,
                errors: ['code.existed'],
            });
        }

        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const id = await this.repo.create(data, transaction);
            return { id };
        };

        if (tx) {
            return await runTransaction(tx);
        }

        return await this.db.$transaction(async (transaction) => {
            return await runTransaction(transaction);
        });
    }

    public async updateOrderExpense(id: number, request: Partial<IOrderExpense>): Promise<IIdResponse> {
        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, { order_id: this.orderRepo });

        await this.repo.update({ id }, request);

        return { id };
    }
}
