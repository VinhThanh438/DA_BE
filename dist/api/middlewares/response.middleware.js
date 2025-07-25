"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseMiddleware = void 0;
const environment_1 = require("../../common/environment");
const express_validation_1 = require("express-validation");
const logger_1 = __importDefault(require("../../common/logger"));
const lodash_1 = require("lodash");
const errors_1 = require("../../common/errors");
const api_error_1 = require("../../common/error/api.error");
class ResponseMiddleware {
    /**
     * Handle error
     * @param err APIError
     * @param req
     * @param res
     * @param next
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static handler(err, req, res, next) {
        const { status = errors_1.StatusCode.SERVER_ERROR, errorCode = 1, messageData } = err;
        let message = '';
        if (messageData !== null) {
            message = req.i18n.t(err.message, messageData);
        }
        else {
            message = req.i18n.t(err.message);
        }
        if (err.message.includes('Foreign key constraint violated')) {
            const violatedConstraint = err.message.match(/`([^`]+)_fkey/);
            const key = violatedConstraint ? violatedConstraint[1] : 'unknown_key';
            logger_1.default.error('Foreign Key constraint violation error:', Object.assign({ errorDetails: JSON.stringify(err), violatedConstraint: key }, (0, lodash_1.pick)(req, ['originalUrl', 'body', 'rawHeaders'])));
            err.message = req.i18n.t('common.foreign-key-constraint-violation', {
                key: key,
            });
            err.status = errors_1.StatusCode.BAD_REQUEST;
        }
        // if (err.status === StatusCode.SERVER_ERROR) {
        //     err.message = req.i18n.t(`common.status.${StatusCode.SERVER_ERROR}`);
        // }
        const response = {
            errorCode: errorCode,
            statusCode: err.status,
            message: err.message ? req.i18n.t(err.message) : err.message,
            stack: err.stack,
            errors: ResponseMiddleware.formatValidationErrors(err.errors),
        };
        if (environment_1.NODE_ENV !== 'development') {
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
     * @returns {errors<string>[]} - A structured object with grouped validation errors.
     */
    static formatValidationErrors(errors) {
        if (errors && Array.isArray(errors))
            return errors;
        if (!errors || typeof errors !== 'object')
            return [];
        const formattedErrors = [];
        Object.entries(errors).forEach(([key, errorObject]) => {
            if (!errorObject || typeof errorObject !== 'object')
                return;
            Object.entries(errorObject).forEach(([_, error]) => {
                var _a;
                if (typeof error === 'object') {
                    const path = error === null || error === void 0 ? void 0 : error.path;
                    const type = error === null || error === void 0 ? void 0 : error.type;
                    let errorType = errors_1.ErrorKey.INVALID;
                    if (type === 'any.required') {
                        errorType = errors_1.ErrorKey.REQUIRED;
                    }
                    let field = 'unknown';
                    if (Array.isArray(path) && path.length > 0) {
                        field = path[path.length - 1];
                    }
                    else if ((_a = error === null || error === void 0 ? void 0 : error.context) === null || _a === void 0 ? void 0 : _a.key) {
                        field = error.context.key;
                    }
                    formattedErrors.push(`${field}.${errorType}`);
                }
                else if (typeof error === 'string') {
                    formattedErrors.push(`${key}.${errors_1.ErrorKey.INVALID}`);
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
    static converter(err, req, res, next) {
        let convertedError;
        if (err instanceof express_validation_1.ValidationError) {
            convertedError = new api_error_1.APIError({
                message: 'common.validate-failed',
                status: errors_1.StatusCode.BAD_REQUEST,
                errors: err.details,
                stack: err.error,
                errorCode: errors_1.ErrorCode.VERIFY_FAILED,
            });
        }
        else if (err instanceof api_error_1.APIError) {
            convertedError = err;
        }
        else {
            convertedError = new api_error_1.APIError({
                message: err.message,
                status: errors_1.StatusCode.SERVER_ERROR,
                stack: err.stack,
                errorCode: errors_1.ErrorCode.SERVER_ERROR,
            });
        }
        if (convertedError.status >= errors_1.StatusCode.SERVER_ERROR) {
            logger_1.default.error('Process request error:', Object.assign({ stringData: JSON.stringify(err) }, (0, lodash_1.pick)(req, ['originalUrl', 'body', 'rawHeaders'])));
        }
        return ResponseMiddleware.handler(convertedError, req, res, next);
    }
    /**
     * Notfound middleware
     * @param req
     * @param res
     * @param next
     */
    static notFound(req, res, next) {
        const err = new api_error_1.APIError({
            message: 'common.resource-not-found',
            status: errors_1.StatusCode.REQUEST_NOT_FOUND,
            stack: '',
            errorCode: errors_1.ErrorCode.REQUEST_NOT_FOUND,
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
    static validateUpdateProfile(err, req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let convertedError;
                if (err instanceof express_validation_1.ValidationError) {
                    const message = ResponseMiddleware.getMessageOfValidationError(err, req);
                    convertedError = new api_error_1.APIError({
                        message: message.replace(/[^a-zA-Z ]/g, ''),
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: err.details,
                        stack: err.error,
                        errorCode: errors_1.ErrorCode.VERIFY_FAILED,
                    });
                    next(convertedError);
                    return;
                }
                next(err);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getMessageOfValidationError(error, req) {
        try {
            const details = error.details;
            if (details.body !== undefined && details.body !== null && details.body.length > 0) {
                return details.body[0].message;
            }
            else if (details.query !== undefined && details.query !== null && details.query.length > 0) {
                return details.query[0].message;
            }
            else if (details.params !== undefined && details.params !== null && details.params.length > 0) {
                return details.params[0].message;
            }
            else if (details.headers !== undefined && details.headers !== null && details.headers.length > 0) {
                return details.headers[0].message;
            }
        }
        catch (error) {
            logger_1.default.error('Error during get message from ValidationError', error);
        }
        return 'common.validate-failed';
    }
}
exports.ResponseMiddleware = ResponseMiddleware;
