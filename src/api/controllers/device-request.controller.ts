import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { DeviceRequestService } from '@common/services/device-request.service';

export class DeviceRequestController {
    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await DeviceRequestService.getAll();
            res.sendJson(result);
        } catch (error) {
            logger.error(`DeviceRequestController.getAll: `, error);
            next(error);
        }
    }

    public static async approveRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const id = Number(req.params.id);
            const { status } = req.body;
            const result = await DeviceRequestService.approveRequest(id, status, userId);
            res.sendJson(result);
        } catch (error) {
            logger.error(`DeviceRequestController.approveRequest: `, error);
            next(error);
        }
    }
}
