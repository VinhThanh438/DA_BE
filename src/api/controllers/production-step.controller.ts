import { ProductionStepService } from '@common/services/master/production-step.service';
import { NextFunction, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { ProductionStep } from '.prisma/client';
import logger from '@common/logger';

export class ProductionStepController extends BaseController<ProductionStep> {
    private static instance: ProductionStepController;
    protected service: ProductionStepService;

    private constructor() {
        super(ProductionStepService.getInstance());
        this.service = ProductionStepService.getInstance();
    }

    static getInstance(): ProductionStepController {
        if (!this.instance) {
            this.instance = new ProductionStepController();
        }
        return this.instance;
    }

    async sample(req: Request, res: Response, next: NextFunction) {
        try {
            // const body = req.body as IProductionStep;
            // const result = await this.service.connect(body);
            // res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.sample: `, error);
            next(error);
        }
    }
}
