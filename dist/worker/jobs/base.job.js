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
exports.BaseJob = void 0;
const logger_1 = __importDefault(require("../../common/logger"));
const queue_service_1 = require("../../common/services/queue.service");
class BaseJob {
    register() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Listening to job: ${this.queueName}`);
            this.worker = yield queue_service_1.QueueService.createWorker({
                queueName: this.queueName,
                processor: this.handler.bind(this),
            });
            this.worker.on('completed', (job) => {
                logger_1.default.debug(`[${this.queueName}] Job completed: ${job.id}`);
            });
            this.worker.on('failed', (job, err) => {
                logger_1.default.error(`[${this.queueName}] Job failed: ${job === null || job === void 0 ? void 0 : job.id}`, err);
            });
            return this;
        });
    }
    clearOldCronJobs(queue) {
        return __awaiter(this, void 0, void 0, function* () {
            const repeatableJobs = yield queue.getRepeatableJobs();
            for (const job of repeatableJobs) {
                if (job.name === this.queueName) {
                    yield queue.removeRepeatableByKey(job.key);
                }
            }
        });
    }
}
exports.BaseJob = BaseJob;
