import { ProductHistoryService } from '@common/services/master/product-history.service';
import { BaseController } from './base.controller';
import { ProductHistories } from '.prisma/client';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';

export class ProductHistoryController extends BaseController<ProductHistories> {
    private static instance: ProductHistoryController;
    protected service: ProductHistoryService;

    private constructor() {
        super(ProductHistoryService.getInstance());
        this.service = ProductHistoryService.getInstance();
    }

    public static getInstance(): ProductHistoryController {
        if (!this.instance) {
            this.instance = new ProductHistoryController();
        }
        return this.instance;
    }

    public async paginate(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query;
            delete query.OR;
            query.product_id = query.productIds ? { in: (query.productIds as any).split(',').map(Number) } : undefined;
            const data = await this.service.paginate(query);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.paginate: `, error);
            next(error);
        }
    }
}
