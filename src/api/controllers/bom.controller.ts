import { ICreateBom, IUpdateBom } from '@common/interfaces/bom.interface';
import { BomService } from '@common/services/bom.service';
import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { Bom } from '.prisma/client';
import logger from '@common/logger';

export class BomController extends BaseController<Bom> {
    private static instance: BomController;
    protected service: BomService;

    private constructor() {
        super(BomService.getInstance());
        this.service = BomService.getInstance();
    }

    static getInstance(): BomController {
        if (!this.instance) {
            this.instance = new BomController();
        }
        return this.instance;
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreateBom;
            const result = await this.service.createBom(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const body = req.body as IUpdateBom;
            const result = await this.service.updateBom(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }

    async getMaterialEstimation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const output = await this.service.getMaterialEstimation(req.query);
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.getMaterialEstimation: `, error);
            next(error);
        }
    }
}
