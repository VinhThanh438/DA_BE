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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const environment_1 = require("../environment");
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const eventbus_1 = __importDefault(require("../eventbus"));
const token_helper_1 = require("../helpers/token.helper");
const logger_1 = __importDefault(require("../logger"));
const token_repo_1 = require("../repositories/token.repo");
const user_repo_1 = require("../repositories/user.repo");
const app_constant_1 = require("../../config/app.constant");
const event_constant_1 = require("../../config/event.constant");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthService {
    static login(body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!body.device && body.username !== environment_1.ADMIN_USER_NAME) {
                throw new api_error_1.APIError({
                    message: 'auth.login.device-not-found',
                    status: errors_1.StatusCode.REQUEST_FORBIDDEN,
                });
            }
            const user = yield this.userRepo.getDetailInfo({ username: body.username });
            if (!user) {
                throw new api_error_1.APIError({
                    message: 'auth.login.not-found',
                    status: errors_1.StatusCode.BAD_REQUEST,
                });
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(body.password, user.password);
            if (!isPasswordValid) {
                throw new api_error_1.APIError({
                    message: 'auth.login.invalid-password',
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`password.${errors_1.ErrorKey.INCORRECT}`],
                });
            }
            if (!((_a = user.device_uid) === null || _a === void 0 ? void 0 : _a.includes(body.device)) && user.username !== environment_1.ADMIN_USER_NAME) {
                if (!user.is_first_loggin) {
                    eventbus_1.default.emit(event_constant_1.EVENT_DEVICE_PENDING_APPROVAL, {
                        device: body.device,
                        ip: body.ip,
                        ua: body.ua,
                        userId: user.id,
                        email: user.email,
                        name: user === null || user === void 0 ? void 0 : user.username,
                    });
                    throw new api_error_1.APIError({
                        message: 'auth.login.device-pending-approval',
                        status: errors_1.StatusCode.REQUEST_FORBIDDEN,
                    });
                }
                eventbus_1.default.emit(event_constant_1.EVENT_USER_FIRST_LOGIN, {
                    id: user.id,
                    device: body.device,
                    status: false,
                });
            }
            const transFormUserData = {
                id: user.id,
                employee_id: user.employee_id,
            };
            const result = {
                access_token: token_helper_1.TokenHelper.generateToken(transFormUserData, body.device),
                refresh_token: token_helper_1.TokenHelper.generateToken(transFormUserData, body.device, app_constant_1.REFRESH_TOKEN_EXPIRED_TIME),
            };
            eventbus_1.default.emit(event_constant_1.EVENT_USER_LOGIN, {
                userId: user.id,
                refreshToken: result.refresh_token,
                ua: body.ua,
                ip: body.ip,
            });
            return result;
        });
    }
    static logOut(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const userToken = yield token_repo_1.TokenRepo.findOne({ refresh_token: refreshToken });
            if (!userToken) {
                throw new api_error_1.APIError({
                    message: 'user.common.not-found',
                    status: errors_1.ErrorCode.REQUEST_UNAUTHORIZED,
                });
            }
            yield this.deleteToken(userToken.id);
            logger_1.default.info('Token deleted');
        });
    }
    static getUserToken(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield token_repo_1.TokenRepo.findOne(data);
            if (!user) {
                throw new api_error_1.APIError({
                    message: 'auth.login.not-found',
                    status: errors_1.StatusCode.BAD_REQUEST,
                });
            }
            return user;
        });
    }
    static flattenOrganizations(org) {
        if (!org)
            return [];
        const result = [];
        const stack = [org];
        while (stack.length) {
            const current = stack.pop();
            if (current) {
                const _a = current, { sub_organization } = _a, orgWithoutChildren = __rest(_a, ["sub_organization"]);
                if ([app_constant_1.OrganizationType.COMPANY, app_constant_1.OrganizationType.HEAD_QUARTER].includes(orgWithoutChildren.type)) {
                    result.push(orgWithoutChildren);
                }
                if (Array.isArray(sub_organization)) {
                    stack.push(...sub_organization);
                }
            }
        }
        return result;
    }
    static getInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.userRepo.findOne({ id }, true);
            if (!user) {
                throw new api_error_1.APIError({
                    message: 'auth.login.not-found',
                    status: errors_1.StatusCode.BAD_REQUEST,
                });
            }
            const _a = user, { organization } = _a, userData = __rest(_a, ["organization"]);
            userData.organizations = this.flattenOrganizations(organization);
            return userData;
        });
    }
    static deleteToken(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenDeleted = yield token_repo_1.TokenRepo.delete(id);
            if (!tokenDeleted) {
                logger_1.default.info('Token not found!');
            }
        });
    }
    static createToken(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield token_repo_1.TokenRepo.create({
                user: {
                    connect: {
                        id: data.userId,
                    },
                },
                refresh_token: data.refreshToken,
                user_agent: data.ua,
                ip_address: data.ip,
            });
        });
    }
    static revokeAllTokens(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield token_repo_1.TokenRepo.deleteMany({ user_id: userId });
        });
    }
}
exports.AuthService = AuthService;
AuthService.userRepo = new user_repo_1.UserRepo();
