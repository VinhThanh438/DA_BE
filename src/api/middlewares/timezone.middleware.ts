import { APIError } from '@common/error/api.error';
import { ErrorKey, StatusCode } from '@common/errors';
import { DEFAULT_TIME_ZONE } from '@config/app.constant';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require x-timezone header from client.
 * If not present, respond with 400 Bad Request.
 */
export function timezoneMiddleWare(req: Request, res: Response, next: NextFunction) {
    const timezone = req.headers['x-timezone'] as string;
    if (!timezone || typeof timezone !== 'string' || timezone.trim() === '') {
        throw new APIError({
            message: 'common.timezone-missing',
            status: StatusCode.REQUEST_FORBIDDEN,
            errors: [`x-timezone.${ErrorKey.NOT_FOUND}`],
        });
    }
    req.userTimezone = timezone || DEFAULT_TIME_ZONE;
    next();
}
