import { RepresentativeService } from '@common/services/representative.service';
import { BaseController } from './base.controller';
import { Representatives } from '.prisma/client';
import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { IRepresenDebtQueryFilter } from '@common/interfaces/representative.interface';

export class RepresentativeController extends BaseController<Representatives> {
    private static instance: RepresentativeController;
    protected service: RepresentativeService;

    private constructor() {
        super(RepresentativeService.getInstance());
        this.service = RepresentativeService.getInstance();
    }

    public static getInstance(): RepresentativeController {
        if (!this.instance) {
            this.instance = new RepresentativeController();
        }
        return this.instance;
    }

    public async getDebt(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as IRepresenDebtQueryFilter;
            const result = await this.service.getDebt(query);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.getDebt: `, error);
            next(error);
        }
    }
}
