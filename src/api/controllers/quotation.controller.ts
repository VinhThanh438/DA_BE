import { IQuotation, ISupplierQuotationRequest } from '@common/interfaces/quotation.interface';
import { IApproveRequest, IIdResponse } from '@common/interfaces/common.interface';
import { QuotationService } from '@common/services/quotation.service';
import { Request, Response, NextFunction } from 'express';
import { QuotationType } from '@config/app.constant';
import { BaseController } from './base.controller';
import { Quotations } from '.prisma/client';
import logger from '@common/logger';

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
            const empId = Number(req.user.employee_id);
            let result: IIdResponse;
            if (body.type === QuotationType.CUSTOMER) {
                result = await this.service.createCustomerQuotation(empId, body as IQuotation);
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

    async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IApproveRequest;
            const id = Number(req.params.id);
            const result = await this.service.approve(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.approve: `, error);
            next(error);
        }
    }
}
