import { BaseController } from './base.controller';
import { Roles } from '.prisma/client';
import { IRole } from '@common/interfaces/role.interface';
import logger from '@common/logger';
import { RoleService } from '@common/services/role.service';
import { NextFunction, Request, Response } from 'express';

export class RoleController extends BaseController<Roles> {
    private static instance: RoleController;
    protected service: RoleService;

    private constructor() {
        super(RoleService.getInstance());
        this.service = RoleService.getInstance();
    }

    public static getInstance(): RoleController {
        if (!this.instance) {
            this.instance = new RoleController();
        }
        return this.instance;
    }

    public async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.service.getAll();
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.getAllRequest: `, error);
            next(error);
        }
    }

    public async updatePermission(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IRole;
            const id = Number(req.params.id);
            const result = await this.service.updatePermission(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.updatePermissionRequest: `, error);
            next(error);
        }
    }
}
