import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { PermissionService } from '@common/services/permission.service';
import { ICreatePermission } from '@common/interfaces/permission.interface';

export class PermissionController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreatePermission;
            const data = await PermissionService.create(body);
            res.sendJson(data);
        } catch (error) {
            logger.error('PermissionController.create: ', error);
            next(error);
        }
    }

    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await PermissionService.getAll();
            res.sendJson(data);
        } catch (error) {
            logger.error('PermissionController.getAll: ', error);
            next(error);
        }
    }

    public static async update(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('PermissionController.update: ', error);
            next(error);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('PermissionController.delete: ', error);
            next(error);
        }
    }

    public static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('PermissionController.getById: ', error);
            next(error);
        }
    }
}
