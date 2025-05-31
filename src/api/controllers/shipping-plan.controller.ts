import { ShippingPlanService } from '@common/services/shipping-plan.service';
import { BaseController } from './base.controller';
import { ShippingPlans } from '.prisma/client';
import { IShippingPlan } from '@common/interfaces/shipping-plan.interface';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';

export class ShippingPlanController extends BaseController<ShippingPlans> {
    private static instance: ShippingPlanController;
    protected service: ShippingPlanService;

    private constructor() {
        super(ShippingPlanService.getInstance());
        this.service = ShippingPlanService.getInstance();
    }

    public static getInstance(): ShippingPlanController {
        if (!this.instance) {
            this.instance = new ShippingPlanController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IShippingPlan;
            const result = await this.service.createShippingPlan(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }
}
