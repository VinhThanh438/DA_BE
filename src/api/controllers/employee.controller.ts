import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { EmployeeService } from '@common/services/employee.service';
import { ICreateEmployee } from '@common/interfaces/employee.interface';
import { IPaginationInput } from '@common/interfaces/common.interface';

export class EmployeeController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreateEmployee;
            const data = await EmployeeService.create(body);
            res.sendJson(data);
        } catch (error) {
            logger.error(`EmployeeController.create: `, error);
            next(error);
        }
    }

    public static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const data = await EmployeeService.findById(id);
            res.sendJson(data);
        } catch (error) {
            logger.error(`EmployeeController.getById: `, error);
            next(error);
        }
    }

    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as IPaginationInput;
            const data = await EmployeeService.paginate(query);
            res.sendJson(data);
        } catch (error) {
            logger.error(`EmployeeController.getAll: `, error);
            next(error);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const data = await EmployeeService.delete(id);
            res.sendJson(data);
        } catch (error) {
            logger.error(`EmployeeController.delete: `, error);
            next(error);
        }
    }

    public static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const request = req.body as ICreateEmployee;
            const result = await EmployeeService.update(id, request);
            res.sendJson(result);
        } catch (error) {
            logger.error(`EmployeeController.update: `, error);
            next(error);
        }
    }
}
