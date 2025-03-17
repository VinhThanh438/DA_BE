import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';

export class TopicController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body
            res.sendJson({ message: 'OK' });
        } catch (error) {
            logger.error('TopicController.method: ', error);
            next(error);
        }
    }

    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson({ message: 'OK' });
        } catch (error) {
            logger.error('TopicController.getAll: ', error);
            next(error);
        }
    }

    public static async update(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson({ message: 'OK' });
        } catch (error) {
            logger.error('TopicController.update: ', error);
            next(error);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson({ message: 'OK' });
        } catch (error) {
            logger.error('TopicController.delete: ', error);
            next(error);
        }
    }

    public static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson({ message: 'OK' });
        } catch (error) {
            logger.error('TopicController.getById: ', error);
            next(error);
        }
    }
}
