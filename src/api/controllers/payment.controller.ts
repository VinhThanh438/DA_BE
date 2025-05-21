import { PaymentService } from '@common/services/payment.service';
import { BaseController } from './base.controller';
import { Payments } from '.prisma/client';
import { IPayment } from '@common/interfaces/payment.interface';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';

export class PaymentController extends BaseController<Payments> {
    private static instance: PaymentController;
    protected service: PaymentService;

    private constructor() {
        super(PaymentService.getInstance());
        this.service = PaymentService.getInstance();
    }

    public static getInstance(): PaymentController {
        if (!this.instance) {
            this.instance = new PaymentController();
        }
        return this.instance;
    }

    public async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IPayment;
            const id = Number(req.params.id);
            const result = await this.service.approve(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
