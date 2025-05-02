import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { EmployeeService } from '@common/services/employee.service';
import { ICreateEmployee } from '@common/interfaces/employee.interface';
import { IPaginationInput } from '@common/interfaces/common.interface';
import { Employees } from '.prisma/client';
import { BaseController } from './base.controller';

export class EmployeeController extends BaseController<Employees> {
    private static instance: EmployeeController;
    protected service: EmployeeService;

    private constructor() {
        super(EmployeeService.getInstance());
        this.service = EmployeeService.getInstance();
    }

    public static getInstance(): EmployeeController {
        if (!this.instance) {
            this.instance = new EmployeeController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreateEmployee;
            const data = await this.service.createEmployee(body);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const data = await this.service.findById(id);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.getById: `, error);
            next(error);
        }
    }

    public async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as IPaginationInput;
            const data = await this.service.paginate(query);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.getAll: `, error);
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const data = await this.service.delete(id);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.delete: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as ICreateEmployee;
            const result = await this.service.updateEmployee(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
