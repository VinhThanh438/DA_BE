import { BaseController } from './base.controller';
import { Invoices } from '.prisma/client';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { IApproveRequest, IInvoice } from '@common/interfaces/invoice.interface';
import { InvoiceService } from '@common/services/invoice.service';
import { InvoiceStatus } from '@config/app.constant';

export class InvoiceController extends BaseController<Invoices> {
    private static instance: InvoiceController;
    protected service: InvoiceService;

    private constructor() {
        super(InvoiceService.getInstance());
        this.service = InvoiceService.getInstance();
    }

    public static getInstance(): InvoiceController {
        if (!this.instance) {
            this.instance = new InvoiceController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IInvoice;
            const result = await this.service.createInvoice(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as IInvoice;
            const data = await this.service.updateInvoice(id, body);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }

    public async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IApproveRequest;
            const id = Number(req.params.id);
            if (body.status === InvoiceStatus.CONFIRMED) {
                body.rejected_reason = '';
            }
            const result = await this.service.update(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.approveRequest: `, error);
            next(error);
        }
    }
}
