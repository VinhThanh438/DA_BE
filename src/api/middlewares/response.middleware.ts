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
        const { status = StatusCode.SERVER_ERROR, errorCode = 1, messageData } = err;

        let message = '';
        if (messageData !== null) {
            message = req.i18n.t(err.message, messageData as any) as string;
        } else {
            message = req.i18n.t(err.message);
        }

        const response: any = {
            error_code: errorCode,
            status_code: err.status,
            message: err.message ? req.i18n.t(err.message) : req.i18n.t(`common.status.${StatusCode.SERVER_ERROR}`),
            stack: err.stack,
            errors: ResponseMiddleware.formatValidationErrors(err.errors),
            message_data: messageData,
        };

        if (NODE_ENV !== 'development') {
            delete response.stack;
        }
        res.status(status);
        res.json(response);
        res.end();
    }

    /**
     * Formats validation errors from a raw error object into a structured format.
     *
     * @param {any} errors - An object containing validation errors to be formatted.
     * @returns {Record<string, any>} - A structured object with grouped validation errors.
     */
    static formatValidationErrors(errors: any): string[] {
        if (!errors || typeof errors !== 'object') return [];

        const formattedErrors: string[] = [];

        Object.entries(errors).forEach(([key, errorObject]) => {
            if (!errorObject || typeof errorObject !== 'object') return;

            Object.entries(errorObject).forEach(([errorKey, error]: [string, any]) => {
                if (typeof error === 'object' && error?.message && error?.context?.key) {
                    const formattedMessage = `${error.context.key}.${error.message.replace(/^"[^"]+"\s/, '')}`.replace(
                        /\s+/g,
                        '_',
                    );
                    formattedErrors.push(formattedMessage);
                }
            });
        });

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
                message: 'common.validate-failed',
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

        if (convertedError.status >= StatusCode.SERVER_ERROR) {
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
            message: 'common.not-found',
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
        return 'common.validate-failed';
    }
}
