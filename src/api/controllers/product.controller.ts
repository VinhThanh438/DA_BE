import { IPaginationInput } from '@common/interfaces/common.interface';
import { ICreateProduct, IUpdateProduct } from '@common/interfaces/product.interface';
import logger from '@common/logger';
import { ProductService } from '@common/services/product.service';
import { NextFunction, Request, Response } from 'express';

export class ProductController {
    private static instance: ProductController;
    protected service: ProductService;

    constructor() {
        this.service = ProductService.getInstance();
    }

    public static getInstance(): ProductController {
        if (!this.instance) {
            this.instance = new ProductController();
        }
        return this.instance;
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreateProduct;
            const output = await this.service.createProduct(body);
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = req.query as IPaginationInput;
            const data = await this.service.getAllProduct({ page, limit });
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.getAll: `, error);
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = await this.service.getById(Number(id));
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.getById: `, error);
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IUpdateProduct;
            const { id } = req.params;
            const output = await this.service.updateProduct(Number(id), body);
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
