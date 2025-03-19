import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { AuthService } from '@common/auth/auth.service';
import { ISignup } from '@common/auth/auth.interface';

export class AuthController {
    public static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ISignup
            const result = await AuthService.login(body)
            res.sendJson({ message: 'OK', data: { id: result.id }});
        } catch (error) {
            logger.error('BaseController.create: ', error);
            next(error);
        }
    }

    public static async signup(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson({ message: 'OK' });
        } catch (error) {
            logger.error('BaseController.getAll: ', error);
            next(error);
        }
    }
}
