import { ShippingPlanService } from '@common/services/master/shipping-plan.service';
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

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as IShippingPlan;
            const isAdmin = Boolean(req.user.isAdmin) || false;
            const result = await this.service.updateShippingPlan(id, body, isAdmin);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const isAdmin = Boolean(req.user.isAdmin) || false;
            const result = await this.service.deleteShippingPlan(id, isAdmin);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.delete: `, error);
            next(error);
        }
    }
}
