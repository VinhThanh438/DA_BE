import { ICreateBank, IPaginationInputBank, IUpdateBank } from '@common/interfaces/bank.interface';
import logger from '@common/logger';
import { BankService } from '@common/services/bank.service';
import { NextFunction, Request, Response } from 'express';

export class BankController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreateBank;
            const data = await BankService.create(body);
            res.sendJson(data);
        } catch (error) {
            logger.error(`BankController.create: `, error);
            next(error);
        }
    }
    public static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as IUpdateBank;
            const data = await BankService.update(id, body);
            res.sendJson(data);
        } catch (error) {
            logger.error(`BankController.update: `, error);
            next(error);
        }
    }
    public static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const data = await BankService.delete(id);
            res.sendJson(data);
        } catch (error) {
            logger.error(`BankController.delete: `, error);
            next(error);
        }
    }
    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, type, id } = req.query as IPaginationInputBank;
            const data = await BankService.getAll({ page, limit }, type ?? '', id ? Number(id) : 0);
            res.sendJson(data);
        } catch (error) {
            logger.error(`BankController.getAll: `, error);
            next(error);
        }
    }
}
