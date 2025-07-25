import { IBankTransfer } from '@common/interfaces/bank.interface';
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
            if (!req.query.partnerId) {
                req.query.partner_id = null as any;
                req.query.representative_id = null as any;
            } else {
                req.query.partner_id = req.query.partnerId;
                delete req.query.partnerId;
            }

            const { page, size, startAt, endAt, keyword, ...query } = req.query;

            let result;
            if (page || size || (startAt && endAt)) {
                result = await this.service.paginate(req.query);
            } else {
                result = await this.service.getAll(query);
            }
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.getAll: `, error);
            next(error);
        }
    }

    public async transfer(req: Request, res: Response, next: NextFunction) {
        try {
            const body: IBankTransfer = req.body;
            const result = await this.service.transfer(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.transfer: `, error);
            next(error);
        }
    }

    public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            const result = await this.service.createBank(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async getFundBalanceById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const bankId = Number(req.params.id);
            const { startAt, endAt } = req.query;
            const result = await this.service.getFundBalanceById(bankId, startAt as string, endAt as string);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.getFundBalanceById: `, error);
            next(error);
        }
    }
}
