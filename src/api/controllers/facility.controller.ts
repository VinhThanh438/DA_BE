import { IFacility } from '@common/interfaces/facility.interface';
import { BaseController } from './base.controller';
import { Facility } from '.prisma/client';
import logger from '@common/logger';
import { FacilityService } from '@common/services/master/facility.service';
import { NextFunction, Request, Response } from 'express';

export class FacilityController extends BaseController<Facility> {
    private static instance: FacilityController;
    protected service: FacilityService;

    private constructor() {
        super(FacilityService.getInstance());
        this.service = FacilityService.getInstance();
    }

    static getInstance(): FacilityController {
        if (!this.instance) {
            this.instance = new FacilityController();
        }
        return this.instance;
    }

    async sample(req: Request, res: Response, next: NextFunction) {
        try {
            // const body = req.body as IFacility;
            // const result = await this.service.connect(body);
            // res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.sample: `, error);
            next(error);
        }
    }
}
