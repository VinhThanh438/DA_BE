import { IApproveRequest } from '@common/interfaces/common.interface';
import { BaseController } from './base.controller';
import { Loans } from '.prisma/client';
import { ILoan } from '@common/interfaces/loan.interface';
import logger from '@common/logger';
import { LoanService } from '@common/services/loan.service';
import { NextFunction, Request, Response } from 'express';

export class LoanController extends BaseController<Loans> {
    private static instance: LoanController;
    protected service: LoanService;

    private constructor() {
        super(LoanService.getInstance());
        this.service = LoanService.getInstance();
    }

    public static getInstance(): LoanController {
        if (!this.instance) {
            this.instance = new LoanController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as Partial<ILoan>;
            const result = await this.service.create(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
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
}
