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
exports.AuthMiddleware = void 0;
const api_error_1 = require("../../common/error/api.error");
const errors_1 = require("../../common/errors");
const eventbus_1 = __importDefault(require("../../common/eventbus"));
const token_helper_1 = require("../../common/helpers/token.helper");
const logger_1 = __importDefault(require("../../common/logger"));
const auth_service_1 = require("../../common/services/auth.service");
const user_service_1 = require("../../common/services/user.service");
const event_constant_1 = require("../../config/event.constant");
class AuthMiddleware {
    /**
     * Build static function to reduce memory when use AuthMiddleware.authenticate for each routing
     *
     * @static
     * @memberOf AuthMiddleware
     */
    static getUserFromToken(token) {
        try {
            return token_helper_1.TokenHelper.decodeToken(token);
        }
        catch (error) {
            return null;
        }
    }
    static authenticate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const authHeader = req.cookies['access_token'];
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    throw new api_error_1.APIError({
                        message: 'auth.common.token-missing',
                        status: errors_1.StatusCode.REQUEST_UNAUTHORIZED,
                    });
                }
                const deviceId = (_a = req === null || req === void 0 ? void 0 : req.userDevice) === null || _a === void 0 ? void 0 : _a.device;
                if (!deviceId) {
                    throw new api_error_1.APIError({
                        message: 'auth.login.device-not-found',
                        status: errors_1.StatusCode.REQUEST_FORBIDDEN,
                    });
                }
                const accessToken = authHeader.split(' ')[1];
                try {
                    const user = token_helper_1.TokenHelper.verifyToken(accessToken, deviceId);
                    req.user = user;
                    const userData = yield user_service_1.UserService.getInstance().findOne({ id: user.id });
                    if (userData === null || userData === void 0 ? void 0 : userData.is_disabled) {
                        throw new api_error_1.APIError({
                            message: 'auth.common.account-locked',
                            status: errors_1.StatusCode.ACCOUNT_LOCKED,
                        });
                    }
                    res.cookie('access_token', 'Bearer ' + accessToken);
                    return next();
                }
                catch (err) {
                    if (err.name === 'TokenExpiredError') {
                        // handle refresh token
                        const refreshToken = req.cookies['refresh_token'];
                        const userToken = yield auth_service_1.AuthService.getUserToken({ refresh_token: refreshToken });
                        if (!userToken) {
                            throw new api_error_1.APIError({
                                message: 'auth.common.session-expired',
                                status: errors_1.StatusCode.REQUEST_UNAUTHORIZED,
                            });
                        }
                        // check expired time
                        if (token_helper_1.TokenHelper.isTokenExpired(refreshToken, deviceId)) {
                            // delete token
                            eventbus_1.default.emit(event_constant_1.EVENT_TOKEN_EXPIRED, userToken.id);
                            throw new api_error_1.APIError({
                                message: 'auth.common.session-expired',
                                status: errors_1.StatusCode.REQUEST_UNAUTHORIZED,
                            });
                        }
                        // generate new access token
                        const user = AuthMiddleware.getUserFromToken(accessToken);
                        if (!user) {
                            throw new api_error_1.APIError({
                                message: 'auth.common.invalid-token',
                                status: errors_1.StatusCode.REQUEST_UNAUTHORIZED,
                            });
                        }
                        const newAccessToken = token_helper_1.TokenHelper.generateToken({ id: user.id, employee_id: user.employee_id }, deviceId);
                        res.cookie('access_token', 'Bearer ' + newAccessToken);
                        req.user = user;
                        return next();
                    }
                    throw new api_error_1.APIError({
                        message: err.message,
                        status: errors_1.StatusCode.REQUEST_UNAUTHORIZED,
                    });
                }
            }
            catch (error) {
                logger_1.default.error(error);
                next(error);
            }
        });
    }
}
exports.AuthMiddleware = AuthMiddleware;
