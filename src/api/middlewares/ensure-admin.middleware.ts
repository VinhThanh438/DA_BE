import { ADMIN_MAIL, ADMIN_PASSWORD, ADMIN_USER_NAME } from '@common/environment';
import logger from '@common/logger';
import { UserService } from '@common/services/user.service';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export class EnsureAdminAccountMiddleware {
    private static userService = UserService.getInstance();

    static async handleOnStartup() {
        try {
            const adminExists = await this.userService.findUser({ username: ADMIN_USER_NAME, email: ADMIN_MAIL });
            if (!adminExists) {
                const deviceUID = crypto.randomBytes(20).toString('hex');
                const result = await this.userService.seedAdmin({
                    username: ADMIN_USER_NAME,
                    password: ADMIN_PASSWORD,
                    email: ADMIN_MAIL,
                });
                if (!result) logger.info('Admin account already exists!');
                else logger.info(`Default admin account create: id: ${result.id}, device_uid: ${deviceUID}`);
            }
        } catch (error) {
            logger.error('Failed to ensure admin account:', error);
        }
    }

    static async handle(req: Request, res: Response, next: NextFunction) {
        await this.handleOnStartup();
        next();
    }
}
