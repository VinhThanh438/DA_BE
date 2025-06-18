import { Deposits } from '.prisma/client';
import { BaseController } from './base.controller';
import { DepositService } from '@common/services/deposit.service';
import { NextFunction, Request, Response } from 'express';
import {
    IDepositApprove,
    IDepositCreate,
    IDepositPaginationInput,
    IDepositSettlement,
    IDepositUpdate,
} from '@common/interfaces/deposit.interface';
import logger from '@common/logger';
import { IPaginationInput } from '@common/interfaces/common.interface';

export class DepositController extends BaseController<Deposits> {
    private static instance: DepositController;
    protected service: DepositService;

    private constructor() {
        super(DepositService.getInstance());
        this.service = DepositService.getInstance();
    }

    public static getInstance(): DepositController {
        if (!this.instance) {
            this.instance = new DepositController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IDepositCreate;
            const uId = req.user.id;
            const eId = req.user.eId;
            const result = await this.service.createDeposit(body, uId, eId);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IDepositUpdate;
            const id = parseInt(req.params.id);
            const result = await this.service.updateDeposit(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }

    public async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IDepositApprove;
            const id = parseInt(req.params.id);
            const result = await this.service.approve(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.approve: `, error);
            next(error);
        }
    }

    public async settlement(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IDepositSettlement;
            const id = parseInt(req.params.id);
            const isAdmin = Boolean(req.user.isAdmin) || false;
            const result = await this.service.settlement(id, body, isAdmin);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.settlement: `, error);
            next(error);
        }
    }

    public async paginate(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.service.paginates(req.query as IPaginationInput);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.paginate: `, error);
            next(error);
        }
    }
}
