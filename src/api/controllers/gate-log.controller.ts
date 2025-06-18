import { IGateLog } from '@common/interfaces/gate-log.interface';
import { BaseController } from './base.controller';
import { GateLogs } from '.prisma/client';
import logger from '@common/logger';
import { GateLogService } from '@common/services/gate-log.service';
import { NextFunction, Request, Response } from 'express';

export class GateLogController extends BaseController<GateLogs> {
    private static instance: GateLogController;
    protected service: GateLogService;

    private constructor() {
        super(GateLogService.getInstance());
        this.service = GateLogService.getInstance();
    }

    public static getInstance(): GateLogController {
        if (!this.instance) {
            this.instance = new GateLogController();
        }
        return this.instance;
    }

    public async assignEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IGateLog;
            const id = Number(req.params.id);
            const result = await this.service.assignEmployee(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.assignEmployee: `, error);
            next(error);
        }
    }

    public async updateGateLog(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IGateLog;
            const id = Number(req.params.id);
            const userId = Number(req.user.id);
            const isAdmin = Boolean(req.user.isAdmin) || false;
            const result = await this.service.updateGateLog(id, body, isAdmin, userId);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.updateGateLog: `, error);
            next(error);
        }
    }

    public async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IGateLog;
            const id = Number(req.params.id);
            const result = await this.service.approve(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.approveRequest: `, error);
            next(error);
        }
    }

    public async connect(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IGateLog;
            const result = await this.service.connect(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.connectRequest: `, error);
            next(error);
        }
    }
}
