import { NextFunction, Request, Response } from 'express';
import { NODE_ENV } from '@common/environment';
import { ValidationError } from 'express-validation';
import logger from '@common/logger';
import { pick } from 'lodash';
import { ErrorCode, StatusCode } from '@common/errors';
import { APIError } from '@common/error/api.error';

export class ResponseMiddleware {
    /**
     * Handle error
     * @param err APIError
     * @param req
     * @param res
     * @param next
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static handler(err: APIError, req: Request, res: Response, next: NextFunction): void {
        const { status = ErrorCode.SERVER_ERROR, errorCode = 1, message_data } = err;

        const response: any = {
            error_code: errorCode,
            status_code: err.status,
            // message: err.status === 500 ? 'Server error!' : message,
            message: err.message,
            stack: err.stack,
            errors: ResponseMiddleware.formatValidationErrors(err.errors),
            message_data,
        };

        if (NODE_ENV !== 'development') {
            delete response.stack;
        }
        res.status(status);
        res.json(response);
        res.end();
    }

    static formatValidationErrors(errors: any): string[] {
        const formattedErrors: string[] = [];

        if (!errors) return formattedErrors;

        for (const key in errors) {
            errors[key].forEach((error: any) => {
                if (error.message) {
                    formattedErrors.push(error.message);
                }
            });
        }

        return formattedErrors;
    }

    /**
     * Convert error if it's not APIError
     * @param err
     * @param req
     * @param res
     * @param next
     */
    static converter(err: Error, req: Request, res: Response, next: NextFunction): void {
        let convertedError: APIError;

        if (err instanceof ValidationError) {
            convertedError = new APIError({
                message: 'Validate failed',
                status: StatusCode.BAD_REQUEST,
                errors: err.details,
                stack: err.error,
                errorCode: ErrorCode.VERIFY_FAILED,
            });
        } else if (err instanceof APIError) {
            convertedError = err;
        } else {
            convertedError = new APIError({
                message: err.message,
                status: StatusCode.SERVER_ERROR,
                stack: err.stack,
                errorCode: ErrorCode.SERVER_ERROR,
            });
        }
        // log error for status >= 500
        if (convertedError.status >= ErrorCode.SERVER_ERROR) {
            logger.error('Process request error:', {
                stringData: JSON.stringify(err),
                ...pick(req, ['originalUrl', 'body', 'rawHeaders']),
            });
        }

        return ResponseMiddleware.handler(convertedError, req, res, next);
    }

    /**
     * Notfound middleware
     * @param req
     * @param res
     * @param next
     */
    static notFound(req: Request, res: Response, next: NextFunction): void {
        const err = new APIError({
            message: 'Not found!',
            status: StatusCode.REQUEST_NOT_FOUND,
            stack: '',
            errorCode: ErrorCode.REQUEST_NOT_FOUND,
        });
        return ResponseMiddleware.handler(err, req, res, next);
    }

    /**
     * Check Rating Score
     *
     * @static
     * @param err
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @memberOf RatingMiddleware
     */
    static async validateUpdateProfile(err: Error, req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let convertedError: APIError;
            if (err instanceof ValidationError) {
                const message = ResponseMiddleware.getMessageOfValidationError(err, req);
                convertedError = new APIError({
                    message: message.replace(/[^a-zA-Z ]/g, ''),
                    status: ErrorCode.BAD_REQUEST,
                    errors: err.details,
                    stack: err.error,
                    errorCode: ErrorCode.VERIFY_FAILED,
                });
                next(convertedError);
                return;
            }
            next(err);
        } catch (error) {
            next(error);
        }
    }

    static getMessageOfValidationError(error: ValidationError, req: Request): string {
        try {
            const details = error.details;
            if (details.body !== undefined && details.body !== null && details.body.length > 0) {
                return details.body[0].message;
            } else if (details.query !== undefined && details.query !== null && details.query.length > 0) {
                return details.query[0].message;
            } else if (details.params !== undefined && details.params !== null && details.params.length > 0) {
                return details.params[0].message;
            } else if (details.headers !== undefined && details.headers !== null && details.headers.length > 0) {
                return details.headers[0].message;
            }
        } catch (error) {
            logger.error('Error during get message from ValidationError', error);
        }
        return 'Validate failed!';
    }
}
