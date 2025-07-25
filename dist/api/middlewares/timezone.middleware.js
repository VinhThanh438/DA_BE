"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timezoneMiddleWare = timezoneMiddleWare;
const api_error_1 = require("../../common/error/api.error");
const errors_1 = require("../../common/errors");
const app_constant_1 = require("../../config/app.constant");
/**
 * Middleware to require x-timezone header from client.
 * If not present, respond with 400 Bad Request.
 */
function timezoneMiddleWare(req, res, next) {
    const timezone = req.headers['x-timezone'];
    if (!timezone || typeof timezone !== 'string' || timezone.trim() === '') {
        throw new api_error_1.APIError({
            message: 'common.timezone-missing',
            status: errors_1.StatusCode.REQUEST_FORBIDDEN,
            errors: [`x-timezone.${errors_1.ErrorKey.NOT_FOUND}`],
        });
    }
    req.userTimezone = timezone || app_constant_1.DEFAULT_TIME_ZONE;
    next();
}
