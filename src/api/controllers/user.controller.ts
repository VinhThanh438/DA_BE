import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { Users } from '.prisma/client';
import { BaseController } from './base.controller';
import { UserService } from '@common/services/user.service';
import { ICreateUser } from '@common/interfaces/user.interface';
import { IPaginationInput } from '@common/interfaces/common.interface';

export class UserController extends BaseController<Users> {
    private static instance: UserController;
    protected service: UserService;

    private constructor() {
        super(UserService.getInstance());
        this.service = UserService.getInstance();
    }

    public static getInstance(): UserController {
        if (!this.instance) {
            this.instance = new UserController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const request: ICreateUser = req.body;
            const data = await this.service.createUser(request);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as ICreateUser;
            const result = await this.service.update(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }

    public async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as ICreateUser;
            const result = await this.service.updateUser(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.updateUser: `, error);
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await this.service.deleteUser(id);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
