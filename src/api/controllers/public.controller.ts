import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { IQuotation, ISupplierQuotationRequest } from '@common/interfaces/quotation.interface';
import { QuotationService } from '@common/services/quotation.service';

export class PublicController {
    private static quotationService = QuotationService.getInstance();

    public static async createSupplierQuotation(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IQuotation | ISupplierQuotationRequest;
            let result = await PublicController.quotationService.createSupplierQuotation(body);
            res.sendJson(result);
        } catch (error) {
            logger.error('PublicController.create: ', error);
            next(error);
        }
    }

    public static async uploadFile(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.file;
            res.sendJson(data);
        } catch (error) {
            logger.error('PublicController.uploadFile', error);
            next(error);
        }
    }
}
