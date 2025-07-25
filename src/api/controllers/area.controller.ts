import { AreasService } from '@common/services/master/area.service';
import { NextFunction, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Areas } from '.prisma/client';
import logger from '@common/logger';

export class AreaController extends BaseController<Areas> {
    private static instance: AreaController;
    protected service: AreasService;

    private constructor() {
        super(AreasService.getInstance());
        this.service = AreasService.getInstance();
    }

    static getInstance(): AreaController {
        if (!this.instance) {
            this.instance = new AreaController();
        }
        return this.instance;
    }

    async sample(req: Request, res: Response, next: NextFunction) {
        try {
            // const body = req.body as IArea;
            // const result = await this.service.connect(body);
            // res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.sample: `, error);
            next(error);
        }
    }
}
