import { QuotationService } from '@common/services/quotation.service';
import { BaseController } from './base.controller';
import { Quotations } from '.prisma/client';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { IApproveRequest, IQuotation, ISupplierQuotationRequest } from '@common/interfaces/quotation.interface';
import { QuotationStatus, QuotationType } from '@config/app.constant';
import { IIdResponse } from '@common/interfaces/common.interface';

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
            const body = req.body as IQuotation | ISupplierQuotationRequest;
            let result: IIdResponse;
            if (body.type === QuotationType.CUSTOMER) {
                result = await this.service.createCustomerQuotation(body);
            } else {
                result = await this.service.createSupplierQuotation(body);
            }
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

    public async updateChildEntity(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IQuotation;
            const id = Number(req.params.id);
            const result = await this.service.updateQuotationEntity(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }

    public async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IApproveRequest;
            const id = Number(req.params.id);
            if (body.status === QuotationStatus.CONFIRMED) {
                body.rejected_reason = '';
            }
            const result = await this.service.update(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
