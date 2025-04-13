import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { IPaginationInput } from '@common/interfaces/common.interface';
import { PartnerService } from '@common/services/partner.service';
import { ICreateAndUpdatePartner } from '@common/interfaces/partner.interface';

export class PartnerController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreateAndUpdatePartner;
            const result = await PartnerService.create(body)
            res.sendJson(result);
        } catch (error) {
            logger.error('PartnerController.create: ', error);
            next(error);
        }
    }

    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = req.query as IPaginationInput;
            const data = await PartnerService.paginate({ page, limit });
            res.sendJson(data);
        } catch (error) {
            logger.error('PartnerController.getAll: ', error);
            next(error);
        }
    }

    public static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const body = req.body
            const result = await PartnerService.update(id, body)
            res.sendJson(result);
        } catch (error) {
            logger.error('PartnerController.update: ', error);
            next(error);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const result = await PartnerService.delete(id)
            res.sendJson(result);
        } catch (error) {
            logger.error('PartnerController.delete: ', error);
            next(error);
        }
    }

    public static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const result = await PartnerService.findById(id)
            res.sendJson(result);
        } catch (error) {
            logger.error('PartnerController.getById: ', error);
            next(error);
        }
    }
}
