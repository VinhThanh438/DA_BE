import { PurchaseRequestService } from '@common/services/purchase-request.service';
import { BaseController } from './base.controller';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { PurchaseRequests } from '.prisma/client';
import { IPurchaseRequest } from '@common/interfaces/purchase-request.interface';

export class PurchaseRequestController extends BaseController<PurchaseRequests> {
    private static instance: PurchaseRequestController;
    protected service: PurchaseRequestService;

    private constructor() {
        super(PurchaseRequestService.getInstance());
        this.service = PurchaseRequestService.getInstance();
    }

    public static getInstance(): PurchaseRequestController {
        if (!this.instance) {
            this.instance = new PurchaseRequestController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IPurchaseRequest;
            const result = await this.service.createPurchaseRequest(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IPurchaseRequest;
            const id = Number(req.params.id);
            const result = await this.service.updatePurchaseRequest(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
