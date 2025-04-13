import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';

export class PermissionGroupController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('PermissionGroupController.create: ', error);
            next(error);
        }
    }

    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('PermissionGroupController.getAll: ', error);
            next(error);
        }
    }

    public static async update(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('PermissionGroupController.update: ', error);
            next(error);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('PermissionGroupController.delete: ', error);
            next(error);
        }
    }

    public static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('PermissionGroupController.getById: ', error);
            next(error);
        }
    }
}
