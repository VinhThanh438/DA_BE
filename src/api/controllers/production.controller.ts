import { BaseController } from './base.controller';
import { Productions } from '.prisma/client';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { ProductionService } from '@common/services/production.service';
import { IProduction } from '@common/interfaces/production.interface';

export class ProductionController extends BaseController<Productions> {
    private static instance: ProductionController;
    protected service: ProductionService;

    private constructor() {
        super(ProductionService.getInstance());
        this.service = ProductionService.getInstance();
    }

    public static getInstance(): ProductionController {
        if (!this.instance) {
            this.instance = new ProductionController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IProduction;
            const result = await this.service.createProduction(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IProduction;
            const id = Number(req.params.id);
            const result = await this.service.updateProduction(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
