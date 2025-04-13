import { IPaginationInput } from "@common/interfaces/common.interface";
import { ICreateAndUpdate } from '@common/interfaces/company.interface';
import logger from "@common/logger";
import { LevelService } from "@common/services/level.service";
import { Request, Response, NextFunction } from "express";

export class LevelController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreateAndUpdate;
            const data = await LevelService.create(body);
            res.sendJson(data);
        } catch (error) {
            logger.error('LevelController.create: ', error);
            next(error);
        }
    }

    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = req.query as IPaginationInput;
            const data = await LevelService.paginate({ page, limit });
            res.sendJson(data);
        } catch (error) {
            logger.error('LevelController.getAll: ', error);
            next(error);
        }
    }

    public static async findOne(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const data = await LevelService.findOne(id);
            res.sendJson(data);
        } catch (error) {
            logger.error('LevelController.getAll: ', error);
            next(error);
        }
    }

    public static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as ICreateAndUpdate;
            const data = await LevelService.update(id, body);
            res.sendJson(data);
        } catch (error) {
            logger.error('LevelController.update: ', error);
            next(error);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const data = await LevelService.delete(id);
            res.sendJson(data);
        } catch (error) {
            logger.error('LevelController.delete: ', error);
            next(error);
        }
    }
}