import logger from '@common/logger';
import { UserService } from '@common/services/user.service';
import { Request, Response, NextFunction } from 'express';

export class EnsureAdminAccountMiddleware {
    static async handleOnStartup() {
        try {
            const adminExists = await UserService.findOne({ username: 'admin' });
            if (!adminExists) {
                await UserService.create({
                    username: 'admin',
                    password: '123456',
                    email: 'vuthanhvinh438@gmail.com',
                    employee_id: 0
                });
            }
            logger.info('Default admin account created');
        } catch (error) {
            logger.error('Failed to ensure admin account:', error);
        }
    }

    static async handle(req: Request, res: Response, next: NextFunction) {
        await this.handleOnStartup();
        next();
    }
}
