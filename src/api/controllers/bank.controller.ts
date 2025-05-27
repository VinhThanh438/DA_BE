import { BaseController } from './base.controller';
import { Banks } from '.prisma/client';
import logger from '@common/logger';
import { BankService } from '@common/services/bank.service';
import { Request, Response, NextFunction } from 'express';

export class BankController extends BaseController<Banks> {
    private static instance: BankController;
    protected service: BankService;

    private constructor() {
        super(BankService.getInstance());
        this.service = BankService.getInstance();
    }

    public static getInstance(): BankController {
        if (!this.instance) {
            this.instance = new BankController();
        }
        return this.instance;
    }

    public async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query;
            const { organizationId, ...restQuery } = query;
            restQuery.organization_id = organizationId;
            const result = await this.service.getAll(restQuery);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.getAll: `, error);
            next(error);
        }
    }
}
