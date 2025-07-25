import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import { ResponseMiddleware } from './response.middleware';
import logger from '@common/logger';

export class RateLimiterMiddleware {
    private static readonly commonOptions = {
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req: Request) => req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.ip || '',
    };

    private static handleRateLimitError(req: Request, res: Response, minutesLeft: number): void {
        try {
            const message = req.i18n.t(`common.status.${StatusCode.REQUEST_TOO_MANY}`, { minute: minutesLeft });
            const error = new APIError({
                message,
                status: StatusCode.REQUEST_TOO_MANY,
                errorCode: 1,
                messageData: { minute: minutesLeft },
            });
            return ResponseMiddleware.handler(error, req, res, () => {});
        } catch (err) {
            logger.error('Rate limit error handler failed:', err);
            throw new APIError({
                message: `common.status.${StatusCode.SERVER_ERROR}`,
                status: StatusCode.SERVER_ERROR,
                errorCode: 1,
            });
        }
    }

    private static createLimiter(minute: number, max: number, skip?: (req: Request) => boolean) {
        return rateLimit({
            windowMs: minute * 60 * 1000,
            max,
            ...RateLimiterMiddleware.commonOptions,
            skip,
            message: (req: Request) => req.i18n.t(`common.status.${StatusCode.REQUEST_TOO_MANY}`, { minute }),
            handler: (req: Request, res: Response) => RateLimiterMiddleware.handleRateLimitError(req, res, minute),
        });
    }

    public static readonly globalLimiter = RateLimiterMiddleware.createLimiter(1, 15, (req) => req.method !== 'POST');

    public static readonly loginLimiter = RateLimiterMiddleware.createLimiter(5, 15);

    public static readonly uploadLimiter = RateLimiterMiddleware.createLimiter(1, 10);

    public static readonly exportFileLimiter = RateLimiterMiddleware.createLimiter(1, 5);
}
