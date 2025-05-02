import { NextFunction, Request, Response } from 'express';
import logger from '@common/logger';
import { ILoginRequest } from '@common/interfaces/auth.interface';
import { AuthService } from '@common/services/auth.service';

export class AuthController {
    public static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ILoginRequest;
            Object.assign(body, req.userDevice);
            const data = await AuthService.login(body);
            res.secureCookie('access_token', 'Bearer ' + data.access_token);
            res.secureCookie('refresh_token', data.refresh_token);
            res.sendJson(data);
        } catch (error) {
            logger.error(`AuthController.create: `, error);
            next(error);
        }
    }

    public static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies['refresh_token'];
            await AuthService.logOut(refreshToken);
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');
            res.sendJson();
        } catch (error) {
            logger.error(`AuthController.logout: `, error);
            next(error);
        }
    }

    public static async getInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.user.id as number;
            const user = await AuthService.getInfo(id);
            res.sendJson(user);
        } catch (error) {
            logger.error(`AuthController.getInfo: `, error);
            next(error);
        }
    }
}
