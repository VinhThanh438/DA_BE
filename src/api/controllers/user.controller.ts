import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { UserService } from '@common/services/user.service';
import { ICreateUser } from '@common/interfaces/user.interface';
import { IPaginationInput } from '@common/interfaces/common.interface';

export class UserController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const request = req.body as ICreateUser;
            const data = await UserService.create(request);
            res.sendJson(data);
        } catch (error) {
            logger.error('UserController.create: ', error);
            next(error);
        }
    }

    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as IPaginationInput;
            const data = await UserService.paginate(query);
            res.sendJson(data);
        } catch (error) {
            logger.error('UserController.getAll: ', error);
            next(error);
        }
    }
    
    public static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const data = await UserService.findById(id)
            res.sendJson(data);
        } catch (error) {
            logger.error('UserController.getById: ', error);
            next(error);
        }
    }

    public static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const body = req.body as ICreateUser
            const result = await UserService.update(id, body)
            res.sendJson(result);
        } catch (error) {
            logger.error('UserController.update: ', error);
            next(error);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const data = await UserService.delete(id)
            res.sendJson(data);
        } catch (error) {
            logger.error('UserController.delete: ', error);
            next(error);
        }
    }
}
