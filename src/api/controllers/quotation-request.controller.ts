import { QuotationRequestService } from '@common/services/quotation-request.service';
import { BaseController } from './base.controller';
import { QuotationRequests } from '.prisma/client';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { IQuotationRequest } from '@common/interfaces/quotation-request.interface';

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

    public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as IQuotationRequest;
            const id = Number(req.params.id);
            const userId = req.user.id;
            const result = await this.service.updateRequestQuotation(id, request, userId);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
