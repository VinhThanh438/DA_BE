"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const api_error_1 = require("../../common/error/api.error");
const errors_1 = require("../../common/errors");
const response_middleware_1 = require("./response.middleware");
const logger_1 = __importDefault(require("../../common/logger"));
class RateLimiterMiddleware {
    static handleRateLimitError(req, res, minutesLeft) {
        try {
            const message = req.i18n.t(`common.status.${errors_1.StatusCode.REQUEST_TOO_MANY}`, { minute: minutesLeft });
            const error = new api_error_1.APIError({
                message,
                status: errors_1.StatusCode.REQUEST_TOO_MANY,
                errorCode: 1,
                messageData: { minute: minutesLeft },
            });
            return response_middleware_1.ResponseMiddleware.handler(error, req, res, () => { });
        }
        catch (err) {
            logger_1.default.error('Rate limit error handler failed:', err);
            throw new api_error_1.APIError({
                message: `common.status.${errors_1.StatusCode.SERVER_ERROR}`,
                status: errors_1.StatusCode.SERVER_ERROR,
                errorCode: 1,
            });
        }
    }
    static createLimiter(minute, max, skip) {
        return (0, express_rate_limit_1.default)(Object.assign(Object.assign({ windowMs: minute * 60 * 1000, max }, RateLimiterMiddleware.commonOptions), { skip, message: (req) => req.i18n.t(`common.status.${errors_1.StatusCode.REQUEST_TOO_MANY}`, { minute }), handler: (req, res) => RateLimiterMiddleware.handleRateLimitError(req, res, minute) }));
    }
}
exports.RateLimiterMiddleware = RateLimiterMiddleware;
RateLimiterMiddleware.commonOptions = {
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => { var _a; return ((_a = req.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.toString().split(',')[0].trim()) || req.ip || ''; },
};
RateLimiterMiddleware.globalLimiter = RateLimiterMiddleware.createLimiter(1, 15, (req) => req.method !== 'POST');
RateLimiterMiddleware.loginLimiter = RateLimiterMiddleware.createLimiter(5, 15);
RateLimiterMiddleware.uploadLimiter = RateLimiterMiddleware.createLimiter(1, 10);
RateLimiterMiddleware.exportFileLimiter = RateLimiterMiddleware.createLimiter(1, 5);
