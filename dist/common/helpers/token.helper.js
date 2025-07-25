"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenHelper = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_constant_1 = require("../../config/app.constant");
const environment_1 = require("../environment");
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
class TokenHelper {
    static generateToken(payload, key, ttl) {
        const secretKey = key + environment_1.JWT_PRIVATE_KEY;
        return jsonwebtoken_1.default.sign(payload, secretKey, {
            expiresIn: ttl || app_constant_1.ACCESS_TOKEN_EXPIRED_TIME,
        });
    }
    static decodeToken(token) {
        return jsonwebtoken_1.default.decode(token);
    }
    static verifyToken(token, key) {
        const secretKey = key + environment_1.JWT_PRIVATE_KEY;
        return jsonwebtoken_1.default.verify(token, secretKey);
    }
    static isTokenExpired(token, key) {
        try {
            const secretKey = key + environment_1.JWT_PRIVATE_KEY;
            const decoded = jsonwebtoken_1.default.verify(token, secretKey);
            if (!decoded.exp)
                return true;
            const expirationTime = decoded.exp * 1000;
            const currentTime = Date.now();
            return expirationTime <= currentTime;
        }
        catch (error) {
            if (error.name === 'TokenExpiredError')
                return true;
            throw new api_error_1.APIError({
                message: 'auth.common.invalid-token',
                status: errors_1.StatusCode.REQUEST_UNAUTHORIZED,
            });
        }
    }
}
exports.TokenHelper = TokenHelper;
