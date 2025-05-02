import { IPaginationInput } from '@common/interfaces/common.interface';
import { ICreateProductGroup, IUpdateProductGroup } from '@common/interfaces/product.interface';
import logger from '@common/logger';
import { ProductGroupService } from '@common/services/product-group.service';
import { NextFunction, Request, Response } from 'express';

export class ProductGroupController {
    private static instance: ProductGroupController;
    protected service: ProductGroupService;

    constructor() {
        this.service = ProductGroupService.getInstance();
    }

    public static getInstance(): ProductGroupController {
        if (!this.instance) {
            this.instance = new ProductGroupController();
        }
        return this.instance;
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreateProductGroup;
            const output = await this.service.create(body);

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
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const output = await this.service.getById(Number(id));
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const body = req.body as IUpdateProductGroup;
            const output = await this.service.update(Number(id), body);
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const output = await this.service.delete(Number(id));
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }
}
