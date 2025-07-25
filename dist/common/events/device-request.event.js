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
exports.DeviceRequestEvent = void 0;
const eventbus_1 = __importDefault(require("../eventbus"));
const logger_1 = __importDefault(require("../logger"));
const queue_service_1 = require("../services/queue.service");
const event_constant_1 = require("../../config/event.constant");
const job_constant_1 = require("../../config/job.constant");
class DeviceRequestEvent {
    /**
     * Register device pending approval event
     */
    static register() {
        eventbus_1.default.on(event_constant_1.EVENT_DEVICE_PENDING_APPROVAL, this.sendPendingMail);
    }
    static sendPendingMail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (yield queue_service_1.QueueService.getQueue(job_constant_1.SEND_PENDING_MAIL_JOB)).add(job_constant_1.SEND_PENDING_MAIL_JOB, {
                    email: data.email,
                    name: data.name,
                });
                logger_1.default.info('DevicePendingApprovalEvent.sendPendingMail: Added send mail job successfully!');
            }
            catch (error) {
                logger_1.default.error('DevicePendingApprovalEvent.sendPendingMail:', error.message);
            }
        });
    }
}
exports.DeviceRequestEvent = DeviceRequestEvent;
