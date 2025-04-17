import { BaseController } from './base.controller';
import { OrganizationService } from '@common/services/organization.service';
import { Organizations } from '.prisma/client';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { ICreateOrganization } from '@common/interfaces/company.interface';

export class OrganizationController extends BaseController<Organizations> {
    private static instance: OrganizationController;
    protected service: OrganizationService;

    private constructor() {
        super(OrganizationService.getInstance());
        this.service = OrganizationService.getInstance();
    }

    public static getInstance(): OrganizationController {
        if (!this.instance) {
            this.instance = new OrganizationController();
        }
        return this.instance;
    }

    public async getHierarchyModel(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.service.getHierarchyModel();
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.getHierarchyModel: `, error);
            next(error);
        }
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreateOrganization;
            const result = await this.service.create(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }
}
