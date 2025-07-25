import { BaseController } from './base.controller';
import { Orders } from '.prisma/client';
import { IApproveRequest } from '@common/interfaces/common.interface';
import { IOrder } from '@common/interfaces/order.interface';
import logger from '@common/logger';
import { OrderService } from '@common/services/order.service';
import { NextFunction, Request, Response } from 'express';

export class OrderController extends BaseController<Orders> {
    private static instance: OrderController;
    protected service: OrderService;

    private constructor() {
        super(OrderService.getInstance());
        this.service = OrderService.getInstance();
    }

    public static getInstance(): OrderController {
        if (!this.instance) {
            this.instance = new OrderController();
        }
        return this.instance;
    }

    public async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IApproveRequest;
            const id = Number(req.params.id);
            const result = await this.service.approve(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.approveRequest: `, error);
            next(error);
        }
    }

    public async updateOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IOrder;
            const id = Number(req.params.id);
            const result = await this.service.updateOrder(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.updateOrderRequest: `, error);
            next(error);
        }
    }

    public async approveShippingPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IApproveRequest;
            const id = Number(req.params.id);
            const result = await this.service.approveShippingPlan(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.approveShippingPlanRequest: `, error);
            next(error);
        }
    }

    public async getPurchaseProcessing(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await this.service.getPurchaseProcessing(id);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.getPurchaseProcessingRequest: `, error);
            next(error);
        }
    }
}
