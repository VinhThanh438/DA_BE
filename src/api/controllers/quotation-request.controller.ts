import { QuotationRequestService } from '@common/services/quotation-request.service';
import { BaseController } from './base.controller';
import { QuotationRequests } from '.prisma/client';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { IApproveRequest } from '@common/interfaces/common.interface';

export class QuotationRequestController extends BaseController<QuotationRequests> {
    private static instance: QuotationRequestController;
    protected service: QuotationRequestService;

    private constructor() {
        super(QuotationRequestService.getInstance());
        this.service = QuotationRequestService.getInstance();
    }

    public static getInstance(): QuotationRequestController {
        if (!this.instance) {
            this.instance = new QuotationRequestController();
        }
        return this.instance;
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query
            delete query.organization_id
            delete query.OR
            const result = await this.service.paginate(query);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.paginate: `, error);
            next(error);
        }
    }

    async approve(req: Request, res: Response, next: NextFunction) {
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
}
