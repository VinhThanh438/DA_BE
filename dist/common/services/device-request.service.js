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
exports.DeviceRequestService = void 0;
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const device_request_repo_1 = require("../repositories/device-request.repo");
const app_constant_1 = require("../../config/app.constant");
const job_constant_1 = require("../../config/job.constant");
const queue_service_1 = require("./queue.service");
const eventbus_1 = __importDefault(require("../eventbus"));
const event_constant_1 = require("../../config/event.constant");
const user_repo_1 = require("../repositories/user.repo");
class DeviceRequestService {
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return device_request_repo_1.DeviceRequestRepo.getAll();
        });
    }
    static devicePendingApproval(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existRequest = yield device_request_repo_1.DeviceRequestRepo.findOne({
                device_uid: data.device,
                user_id: data.userId,
            });
            if (!existRequest) {
                yield device_request_repo_1.DeviceRequestRepo.create({
                    device_uid: data.device,
                    ip_address: data.ip,
                    user_agent: data.ua,
                    user_id: data.userId,
                });
            }
        });
    }
    static approveRequest(id, status, approvedBy) {
        return __awaiter(this, void 0, void 0, function* () {
            const existRequest = yield device_request_repo_1.DeviceRequestRepo.findOne({ id, status: app_constant_1.RequestStatus.PENDING });
            if (!existRequest) {
                throw new api_error_1.APIError({
                    message: 'request.common.not-found',
                    status: errors_1.StatusCode.REQUEST_NOT_FOUND,
                });
            }
            const data = (yield device_request_repo_1.DeviceRequestRepo.update(id, status, approvedBy));
            if (!data) {
                throw new api_error_1.APIError({
                    message: 'request.common.not-found',
                    status: errors_1.StatusCode.REQUEST_NOT_FOUND,
                });
            }
            const userData = yield this.userRepo.findOne({ id: data.userId });
            if (!userData) {
                throw new api_error_1.APIError({
                    message: 'user.common.not-found',
                    status: errors_1.StatusCode.REQUEST_NOT_FOUND,
                });
            }
            // send email
            yield (yield queue_service_1.QueueService.getQueue(job_constant_1.SEND_CONFIRM_MAIL_JOB)).add(job_constant_1.SEND_CONFIRM_MAIL_JOB, {
                email: userData === null || userData === void 0 ? void 0 : userData.email,
                name: userData === null || userData === void 0 ? void 0 : userData.username,
                status,
            });
            // allow user loggin without device id
            eventbus_1.default.emit(event_constant_1.EVENT_USER_FIRST_LOGIN, {
                id: userData.id,
                device: undefined,
                status: true,
            });
            return data;
        });
    }
}
exports.DeviceRequestService = DeviceRequestService;
DeviceRequestService.userRepo = new user_repo_1.UserRepo();
