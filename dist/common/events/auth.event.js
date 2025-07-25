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
exports.AuthEvent = void 0;
const eventbus_1 = __importDefault(require("../eventbus"));
const logger_1 = __importDefault(require("../logger"));
const auth_service_1 = require("../services/auth.service");
const device_request_service_1 = require("../services/device-request.service");
const user_service_1 = require("../services/user.service");
const event_constant_1 = require("../../config/event.constant");
class AuthEvent {
    /**
     * Register auth event
     */
    static register() {
        eventbus_1.default.on(event_constant_1.EVENT_TOKEN_EXPIRED, this.tokenExpiredHandler);
        eventbus_1.default.on(event_constant_1.EVENT_USER_LOGIN, this.userLogInHandler);
        eventbus_1.default.on(event_constant_1.EVENT_DEVICE_PENDING_APPROVAL, this.devicePendingApprovalHandler);
        eventbus_1.default.on(event_constant_1.EVENT_USER_FIRST_LOGIN, this.updateLogginStatusHandler);
    }
    static tokenExpiredHandler(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield auth_service_1.AuthService.deleteToken(id);
                logger_1.default.info(`AuthEvent.tokenExpiredHandler: Token deleted`);
            }
            catch (error) {
                logger_1.default.error(`AuthEvent.tokenExpiredHandler: `, error.message);
            }
        });
    }
    static userLogInHandler(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield auth_service_1.AuthService.createToken(data);
                logger_1.default.info(`AuthEvent.userLogInHandler: Token has been saved`);
            }
            catch (error) {
                logger_1.default.error(`AuthEvent.userLogInHandler: `, error.message);
            }
        });
    }
    static devicePendingApprovalHandler(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield device_request_service_1.DeviceRequestService.devicePendingApproval(data);
                logger_1.default.info(`AuthEvent.devicePendingApprovalHandler: Device pending approval`);
            }
            catch (error) {
                logger_1.default.error(`AuthEvent.devicePendingApprovalHandler:`, error.message);
            }
        });
    }
    static updateLogginStatusHandler(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (data.status) {
                    yield auth_service_1.AuthService.revokeAllTokens(data.id);
                }
                const result = yield this.userService.updateLoginStatus(data);
                logger_1.default.info(`AuthEvent.updateLogginStatusHandler: User first loggin status updated id: ${result.id}`);
            }
            catch (error) {
                logger_1.default.error(`AuthEvent.updateLogginStatusHandler:`, error.message);
            }
        });
    }
}
exports.AuthEvent = AuthEvent;
AuthEvent.userService = user_service_1.UserService.getInstance();
