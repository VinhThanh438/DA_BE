import { BillOfMaterialService } from '@common/services/bill-of-material.service';
import { BaseController } from './base.controller';
import { BillOfMaterials } from '.prisma/client';
import { Request, Response, NextFunction } from 'express';
import { IBillOfMaterial } from '@common/interfaces/bill-of-material.interface';
import logger from '@common/logger';

export class BillOfMaterialController extends BaseController<BillOfMaterials> {
    private static instance: BillOfMaterialController;
    protected service: BillOfMaterialService;

    private constructor() {
        super(BillOfMaterialService.getInstance());
        this.service = BillOfMaterialService.getInstance();
    }

    public static getInstance(): BillOfMaterialController {
        if (!this.instance) {
            this.instance = new BillOfMaterialController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IBillOfMaterial;
            const result = await this.service.createBom(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const body = req.body as IBillOfMaterial;
            const result = await this.service.updateBom(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }
}
