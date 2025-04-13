import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';

export class BaseController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('BaseController.create: ', error);
            next(error);
        }
    }

    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('BaseController.getAll: ', error);
            next(error);
        }
    }

    public static async update(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('BaseController.update: ', error);
            next(error);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('BaseController.delete: ', error);
            next(error);
        }
    }

    public static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('BaseController.getById: ', error);
            next(error);
        }
    }
}
