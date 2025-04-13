import { IPaginationInput } from "@common/interfaces/common.interface";
import { ICreateAndUpdate } from '@common/interfaces/company.interface';
import logger from "@common/logger";
import { JobTitleService } from "@common/services/job-title.service";
import { Request, Response, NextFunction } from "express";

export class JobTitleController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreateAndUpdate;
            const data = await JobTitleService.create(body);
            res.sendJson(data);
        } catch (error) {
            logger.error('JobTitleController.create: ', error);
            next(error);
        }
    }

    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = req.query as IPaginationInput;
            const data = await JobTitleService.paginate({ page, limit });
            res.sendJson(data);
        } catch (error) {
            logger.error('JobTitleController.getAll: ', error);
            next(error);
        }
    }

    public static async findOne(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const data = await JobTitleService.findOne(id);
            res.sendJson(data);
        } catch (error) {
            logger.error('JobTitleController.getAll: ', error);
            next(error);
        }
    }

    public static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as ICreateAndUpdate;
            const data = await JobTitleService.update(id, body);
            res.sendJson(data);
        } catch (error) {
            logger.error('JobTitleController.update: ', error);
            next(error);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const data = await JobTitleService.delete(id);
            res.sendJson(data);
        } catch (error) {
            logger.error('JobTitleController.delete: ', error);
            next(error);
        }
    }
}