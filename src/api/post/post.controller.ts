import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { PostService } from '@common/post/post.service';

export class PostController {
    public static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const result = await PostService.create(data)
            res.sendJson({ message: 'OK' });
        } catch (error) {
            logger.error('PostController.create: ', error);
            next(error);
        }
    }
}
