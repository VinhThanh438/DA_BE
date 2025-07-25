import { IProduct, IUpdateProduct } from '@common/interfaces/product.interface';
import { ProductService } from '@common/services/product.service';
import { NextFunction, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Products } from '.prisma/client';
import logger from '@common/logger';

export class ProductController extends BaseController<Products> {
    private static instance: ProductController;
    protected service: ProductService;

    private constructor() {
        super(ProductService.getInstance());
        this.service = ProductService.getInstance();
    }

    static getInstance(): ProductController {
        if (!this.instance) {
            this.instance = new ProductController();
        }
        return this.instance;
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IProduct;
            const output = await this.service.createProduct(body);
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
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

    async search(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const output = await this.service.search({ ...req.query, isPublic: true });
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.search: `, error);
            next(error);
        }
    }
}
