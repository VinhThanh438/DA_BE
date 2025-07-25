import { IPaginationInput } from '@common/interfaces/common.interface';
import { ICreateUnit, IUpdateUnit } from '@common/interfaces/product.interface';
import logger from '@common/logger';
import { UnitService } from '@common/services/master/unit.service';
import { NextFunction, Request, Response } from 'express';

export class UnitController {
    private static controller: UnitController;
    protected service: UnitService;

    constructor() {
        this.service = UnitService.getInstance();
    }

    public static getInstance(): UnitController {
        if (!this.controller) {
            this.controller = new UnitController();
        }
        return this.controller;
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const input = req.body as ICreateUnit;
            const output = await this.service.create(input);
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const input = req.query as IPaginationInput;
            const output = await this.service.getAll(input);
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.getAll: `, error);
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const output = await this.service.getById(Number(id));
            res.sendJson(output);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const body = req.body as IUpdateUnit;
            const output = await this.service.update(Number(id), body);
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const output = await this.service.delete(Number(id));
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.delete: `, error);
            next(error);
        }
    }
}
