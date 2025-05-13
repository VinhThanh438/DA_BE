import { BaseController } from './base.controller';
import { FinanceRecords } from '.prisma/client';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { IFinanceRecord } from '@common/interfaces/finance-record.interface';
import { FinanceRecordService } from '@common/services/finance-record.service';

export class FinanceRecordController extends BaseController<FinanceRecords> {
    private static instance: FinanceRecordController;
    protected service: FinanceRecordService;

    private constructor() {
        super(FinanceRecordService.getInstance());
        this.service = FinanceRecordService.getInstance();
    }

    public static getInstance(): FinanceRecordController {
        if (!this.instance) {
            this.instance = new FinanceRecordController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IFinanceRecord;
            const result = await this.service.createFinanceRecord(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IFinanceRecord;
            const id = Number(req.params.id);
            const result = await this.service.updateFinanceRecord(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
