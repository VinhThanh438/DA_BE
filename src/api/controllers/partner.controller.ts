import { PartnerService } from '@common/services/partner.service';
import { BaseController } from './base.controller';
import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { IPartnerDebtQueryFilter } from '@common/interfaces/partner.interface';
import { Prisma } from '.prisma/client';

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

    public async paginate(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as IPartnerDebtQueryFilter;
            const data = await this.service.paginate(query);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.paginate: `, error);
            next(error);
        }
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

    public async getCommissionDebt(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as IPartnerDebtQueryFilter;
            const result = await this.service.getCommissionDebt(query);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.getCommissionDebt: `, error);
            next(error);
        }
    }

    public async findByConditions(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as Prisma.PartnersWhereInput;
            const result = await this.service.findByConditions(query);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.findByConditions: `, error);
            next(error);
        }
    }
}
