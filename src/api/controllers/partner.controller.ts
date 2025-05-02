import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { PartnerService } from '@common/services/partner.service';
import { ICreatePartner, IPaginationInputPartner, IUpdatePartner } from '@common/interfaces/partner.interface';

export class PartnerController {
    protected service: PartnerService;
    public static instance: PartnerController;
    private constructor() {
        this.service = PartnerService.getInstance();
    }
    public static getInstance() {
        if (!this.instance) {
            this.instance = new PartnerController();
        }
        return this.instance;
    }
    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreatePartner;

            const result = await this.service.createPartner(body);

            res.sendJson(result);
        } catch (error) {
            logger.error(`PartnerController.create: `, error);
            next(error);
        }
    }
    public async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, type, organization_id } = req.query as IPaginationInputPartner;
            const data = await this.service.getAllPartner({ page, limit }, type || '', organization_id || null);
            res.sendJson(data);
        } catch (error) {
            logger.error(`PartnerController.getAll: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as IUpdatePartner;
            const result = await this.service.updatePartner(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`PartnerController.update: `, error);
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await this.service.deletePartner(id);
            res.sendJson(result);
        } catch (error) {
            logger.error(`PartnerController.delete: `, error);
            next(error);
        }
    }

    public async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await this.service.findByIdPartner(id);
            res.sendJson(result);
        } catch (error) {
            logger.error(`PartnerController.getById: `, error);
            next(error);
        }
    }
}
