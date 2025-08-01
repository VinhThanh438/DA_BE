import { BaseController } from './base.controller';
import { OrganizationService } from '@common/services/organization.service';
import { Organizations } from '.prisma/client';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { IOrganization } from '@common/interfaces/organization.interface';
import { IPaginationInput } from '@common/interfaces/common.interface';
import { OrganizationTypeIndex } from '@config/app.constant';

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
            const body = req.body as IOrganization;
            const result = await this.service.createOrganization(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as IOrganization;
            const result = await this.service.updateOrganization(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await this.service.deleteOrganization(id);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.delete: `, error);
            next(error);
        }
    }

    public async paginate(req: Request, res: Response, next: NextFunction) {
        try {
            const { parentId, organization_id, ...query } = req.query as IPaginationInput;
            query.parent_id = parentId ? Number(parentId) : {};
            delete query.OR;
            const result = await this.service.paginate(query);
            result.data = result.data.sort((a: any, b: any) => {
                const indexA = OrganizationTypeIndex.get(a.type) ?? Infinity;
                const indexB = OrganizationTypeIndex.get(b.type) ?? Infinity;
                return indexA - indexB;
            });
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.paginate: `, error);
            next(error);
        }
    }
}
