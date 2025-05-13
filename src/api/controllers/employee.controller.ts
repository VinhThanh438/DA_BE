import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { EmployeeService } from '@common/services/employee.service';
import { IEmployee, IUpdateEmployee } from '@common/interfaces/employee.interface';
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

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as IUpdateEmployee;
            const result = await this.service.updateEmployee(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
