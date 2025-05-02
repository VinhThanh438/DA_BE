import { QuotationService } from '@common/services/quotation.service';
import { BaseController } from './base.controller';
import { Quotations } from '.prisma/client';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { IQuotation } from '@common/interfaces/quotation.interface';

export class QuotationController extends BaseController<Quotations> {
    private static instance: QuotationController;
    protected service: QuotationService;

    private constructor() {
        super(QuotationService.getInstance());
        this.service = QuotationService.getInstance();
    }

    public static getInstance(): QuotationController {
        if (!this.instance) {
            this.instance = new QuotationController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IQuotation;
            const result = await this.service.createQuotation(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IQuotation;
            const id = Number(req.params.id);
            const result = await this.service.updateQuotation(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
