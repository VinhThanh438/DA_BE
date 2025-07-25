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
exports.DeviceRequestController = void 0;
const logger_1 = __importDefault(require("../../common/logger"));
const device_request_service_1 = require("../../common/services/device-request.service");
class DeviceRequestController {
    static getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield device_request_service_1.DeviceRequestService.getAll();
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`DeviceRequestController.getAll: `, error);
                next(error);
            }
        });
    }
    static approveRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const id = Number(req.params.id);
                const { status } = req.body;
                const result = yield device_request_service_1.DeviceRequestService.approveRequest(id, status, userId);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`DeviceRequestController.approveRequest: `, error);
                next(error);
            }
        });
    }
}
exports.DeviceRequestController = DeviceRequestController;
