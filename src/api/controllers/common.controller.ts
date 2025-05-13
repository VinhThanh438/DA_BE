import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { CommonService } from '@common/services/common.service';

export class CommonController {
    public static async uploadFile(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.file;
            res.sendJson(data);
        } catch (error) {
            logger.error('CommonController.uploadFile', error);
            next(error);
        }
    }

    public static async getCode(req: Request, res: Response, next: NextFunction) {
        try {
            const modelName = req.query.type?.toString().toUpperCase() as string;
            const newCode = await CommonService.getCode(modelName);
            res.sendJson(newCode);
        } catch (error) {
            logger.error('CommonController.getCode', error);
            next(error);
        }
    }

    public static async checkBankAccount(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('CommonController.checkBankAccount', error);
            next(error);
        }
    }
}
