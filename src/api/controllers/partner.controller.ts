import { PartnerService } from '@common/services/partner.service';
import { BaseController } from './base.controller';
import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { IPartnerDebtQueryFilter } from '@common/interfaces/partner.interface';

export class PartnerController extends BaseController {
    private static instance: PartnerController;
    protected service: PartnerService;

    private constructor() {
        super(PartnerService.getInstance());
        this.service = PartnerService.getInstance();
    }

    public static getInstance(): PartnerController {
        if (!this.instance) {
            this.instance = new PartnerController();
        }
        return this.instance;
    }

    public async getDebt(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as IPartnerDebtQueryFilter;
            const result = await this.service.getDebt(query);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.getDebt: `, error);
            next(error);
        }
    }
}
