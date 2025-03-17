import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { TopicService } from '@common/topic/topic.service';
import { ICreateTopic } from '@common/topic/topic.interface';

export class TopicController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const request = req.body as ICreateTopic;
            const result = await TopicService.create(request)
            res.sendJson({ message: 'OK', data: { id: result.id }});
        } catch (error) {
            logger.error('TopicController.method: ', error);
            next(error);
        }
    }

    public static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const keyWord = req.query.s_global as string || ''
            const result = await TopicService.getAll(keyWord)
            res.sendJson({ message: 'OK', data: result });
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
