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
            const { page, size, keyword, ...query } = req.query;
            let result;
            if (page || size) {
                result = await this.service.paginate(req.query);
            }
            result = await this.service.getAll(query);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.getAll: `, error);
            next(error);
        }
    }
}
