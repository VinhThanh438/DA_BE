import { BaseController } from './base.controller';
import { JobPositions } from '.prisma/client';
import { ICreateUpdateJobPosition } from '@common/interfaces/company.interface';
import logger from '@common/logger';
import { JobPositionService } from '@common/services/job-position.service';
import { Request, Response, NextFunction } from 'express';

export class JobPositionController extends BaseController<JobPositions> {
    private static instance: JobPositionController;
    protected service: JobPositionService;

    private constructor() {
        super(JobPositionService.getInstance());
        this.service = JobPositionService.getInstance();
    }

    public static getInstance(): JobPositionController {
        if (!this.instance) {
            this.instance = new JobPositionController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreateUpdateJobPosition;
            const result = await this.service.create(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }
}
