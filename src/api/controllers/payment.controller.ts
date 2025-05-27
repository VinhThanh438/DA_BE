import { PaymentService } from '@common/services/payment.service';
import { BaseController } from './base.controller';
import { Payments } from '.prisma/client';
import { IPayment } from '@common/interfaces/payment.interface';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { IApproveRequest, IPaginationInput } from '@common/interfaces/common.interface';

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

    public async paginate(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as IPaginationInput;
            const { bankId, ...restQuery } = query;
            restQuery.bank_id = bankId;
            const result = await this.service.paginate(restQuery);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.paginate: `, error);
            next(error);
        }
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
            const body = req.body as Partial<IPayment>;
            const result = await this.service.createPayment(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as Partial<IPayment>;
            const id = Number(req.params.id);
            const result = await this.service.updatePayment(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
