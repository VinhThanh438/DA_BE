import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { CommonService } from '@common/services/common.service';

export class CommonController {
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
}
