import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { PartnerGroupService } from '@common/services/partner-group.service';
import { IPaginationInput } from '@common/interfaces/common.interface';
import { IPaginationInputPartnerGroup } from '@common/interfaces/partner.interface';

export class PartnerGroupController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body;
            const result = await PartnerGroupService.create(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`PartnerGroupController.create: `, error);
            next(error);
        }
    }

    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, type } = req.query as IPaginationInputPartnerGroup;
            const data = await PartnerGroupService.paginate({ page, limit }, type || '');
            res.sendJson(data);
        } catch (error) {
            logger.error(`PartnerGroupController.getAll: `, error);
            next(error);
        }
    }

    public static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body;
            const result = await PartnerGroupService.update(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`PartnerGroupController.update: `, error);
            next(error);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await PartnerGroupService.delete(id);
            res.sendJson(result);
        } catch (error) {
            logger.error(`PartnerGroupController.delete: `, error);
            next(error);
        }
    }

    public static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await PartnerGroupService.findById(id);
            res.sendJson(result);
        } catch (error) {
            logger.error(`PartnerGroupController.getById: `, error);
            next(error);
        }
    }
}
