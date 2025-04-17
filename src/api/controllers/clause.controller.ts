import { ICreateClause, IPaginationInputClause, IUpdateClause } from '@common/interfaces/clause.interface';
import logger from '@common/logger';
import { ClauseService } from '@common/services/clause.service';
import { NextFunction, Request, Response } from 'express';

export class ClauseController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreateClause;
            const data = await ClauseService.create(body);
            res.sendJson(data);
        } catch (error) {
            logger.error(`ClauseController.create: `, error);
            next(error);
        }
    }
    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, organization_id } = req.query as IPaginationInputClause;
            const data = await ClauseService.getAll({ page, limit }, organization_id || null);
            res.sendJson(data);
        } catch (error) {
            logger.error(`ClauseController.getAll: `, error);
            next(error);
        }
    }
    public static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const data = await ClauseService.delete(id);
            res.sendJson(data);
        } catch (error) {
            logger.error(`ClauseController.delete: `, error);
            next(error);
        }
    }
    public static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as IUpdateClause;
            const data = await ClauseService.update(id, body);
            res.sendJson(data);
        } catch (error) {
            logger.error(`ClauseController.update: `, error);
            next(error);
        }
    }
}
