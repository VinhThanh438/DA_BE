import { ProductionService } from '@common/services/production/production.service';
import { Request, Response, NextFunction } from 'express';
import { ProductionType } from '@config/app.constant';
import { BaseController } from './base.controller';
import { Productions } from '.prisma/client';
import logger from '@common/logger';

export class ProductionController extends BaseController<Productions> {
    private static instance: ProductionController;
    protected service: ProductionService;

    private constructor() {
        super(ProductionService.getInstance());
        this.service = ProductionService.getInstance();
    }

    static getInstance(): ProductionController {
        if (!this.instance) {
            this.instance = new ProductionController();
        }
        return this.instance;
    }

    async paginate(req: Request, res: Response, next: NextFunction) {
        try {
            const { type, ...filter } = req.query;

            let result = null;
            if (type === 'mesh') {
                result = await this.service.paginate(filter);
            } else {
                result = await this.service.paginate(filter);
            }
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.paginate: `, error);
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body;

            let result = null;
            if (body.type === ProductionType.MESH) {
                result = await this.service.createMeshProduction(body);
            } else {
                result = await this.service.create(body);
            }

            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body;
            const id = Number(req.params.id);

            let result = null;
            if (body.type === ProductionType.MESH) {
                result = await this.service.updateMeshProduction(id, body);
            } else {
                result = await this.service.updateProduction(id, body);
            }

            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
