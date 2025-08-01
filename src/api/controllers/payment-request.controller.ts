import { PaymentRequestService } from '@common/services/payment-request.service';
import { BaseController } from './base.controller';
import { PaymentRequests } from '.prisma/client';
import { IPaymentRequest } from '@common/interfaces/payment-request.interface';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { IApproveRequest } from '@common/interfaces/common.interface';

export class PaymentRequestController extends BaseController<PaymentRequests> {
    private static instance: PaymentRequestController;
    protected service: PaymentRequestService;

    private constructor() {
        super(PaymentRequestService.getInstance());
        this.service = PaymentRequestService.getInstance();
    }

    public static getInstance(): PaymentRequestController {
        if (!this.instance) {
            this.instance = new PaymentRequestController();
        }
        return this.instance;
    }

    public async approve(req: Request, res: Response, next: NextFunction) {
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

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IPaymentRequest;
            const result = await this.service.createPaymentRequest(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IPaymentRequest;
            const id = Number(req.params.id);
            const result = await this.service.updatePaymentRequest(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
