import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import { ResponseMiddleware } from './response.middleware';

export class RateLimiterMiddleware {
    private static commonOptions = {
        standardHeaders: true, // Return rate limit information in response headers
        legacyHeaders: false, // Disable legacy x-rate-limit-* headers
        keyGenerator: (req: Request) => {
            return req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.ip || '';
        },
    };

    /**
     * Handle rate limit error
     * @param req
     * @param res
     */
    static handleRateLimitError(req: Request, res: Response, minutesLeft: number): void {
        const message = req.i18n.t(`common.status.${StatusCode.REQUEST_TOO_MANY}`, { minute: minutesLeft });

        const error = new APIError({
            message: message,
            status: StatusCode.REQUEST_TOO_MANY,
            errorCode: 1,
            messageData: { minute: minutesLeft },
        });

        return ResponseMiddleware.handler(error, req, res, () => {});
    }

    /**
     * @returns RateLimiterMiddleware - A global rate limiter instance.
     * @description Creates and returns a global rate limiter to be used across all routes.
     */
    public static createGlobalLimiter() {
        const minute = 1;
        const timeout = minute * 60 * 1000; // 1 minute
        const options: Parameters<typeof rateLimit>[0] = {
            windowMs: timeout, // 1 minute
            max: 15, // Maximum of requests per IP within the window
            message: (req: Request) => {
                const minute = 1;
                return req.i18n.t(`common.status.${StatusCode.REQUEST_TOO_MANY}`, { minute });
            },
            handler: (req: Request, res: Response) => {
                RateLimiterMiddleware.handleRateLimitError(req, res, minute);
            },
            ...this.commonOptions,
            skip: (req: Request) => req.method !== 'POST',
        };

        return rateLimit(options);
    }

    /**
     * @returns RateLimiterMiddleware - A rate limiter instance for login route.
     * @description Creates and returns a rate limiter for login route with custom options.
     */
    public static createLoginLimiter() {
        const minute = 5;
        const timeout = minute * 60 * 1000;
        const options: Parameters<typeof rateLimit>[0] = {
            windowMs: timeout,
            max: 15,
            message: (req: Request) => {
                return req.i18n.t(`common.status.${StatusCode.REQUEST_TOO_MANY}`, { minute });
            },
            handler: (req: Request, res: Response) => {
                RateLimiterMiddleware.handleRateLimitError(req, res, minute);
            },
            ...this.commonOptions,
        };

        return rateLimit(options);
    }
}
