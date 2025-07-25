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
exports.AuthController = void 0;
const logger_1 = __importDefault(require("../../common/logger"));
const auth_service_1 = require("../../common/services/auth.service");
class AuthController {
    static login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                Object.assign(body, req.userDevice);
                const data = yield auth_service_1.AuthService.login(body);
                res.secureCookie('access_token', 'Bearer ' + data.access_token);
                res.secureCookie('refresh_token', data.refresh_token);
                res.sendJson(data);
            }
            catch (error) {
                logger_1.default.error(`AuthController.create: `, error);
                next(error);
            }
        });
    }
    static logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies['refresh_token'];
                yield auth_service_1.AuthService.logOut(refreshToken);
                res.clearCookie('access_token');
                res.clearCookie('refresh_token');
                res.sendJson();
            }
            catch (error) {
                logger_1.default.error(`AuthController.logout: `, error);
                next(error);
            }
        });
    }
    static getInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.user.id;
                const user = yield auth_service_1.AuthService.getInfo(id);
                res.sendJson(user);
            }
            catch (error) {
                logger_1.default.error(`AuthController.getInfo: `, error);
                next(error);
            }
        });
    }
}
exports.AuthController = AuthController;
