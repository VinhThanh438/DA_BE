import { OrderExpenseService } from '@common/services/order-expense.service';
import { BaseController } from './base.controller';
import { OrderExpenses } from '.prisma/client';
import { IOrderExpense } from '@common/interfaces/order-expense.interface';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';

export class OrderExpenseController extends BaseController<OrderExpenses> {
    private static instance: OrderExpenseController;
    protected service: OrderExpenseService;

    private constructor() {
        super(OrderExpenseService.getInstance());
        this.service = OrderExpenseService.getInstance();
    }

    public static getInstance(): OrderExpenseController {
        if (!this.instance) {
            this.instance = new OrderExpenseController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IOrderExpense;
            const result = await this.service.createOrderExpense(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const body = req.body as IOrderExpense;
            const result = await this.service.updateOrderExpense(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }
}
