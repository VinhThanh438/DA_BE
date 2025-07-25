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
exports.QueueService = void 0;
const bullmq_1 = require("bullmq");
const redis_adapter_1 = require("../infrastructure/redis.adapter");
const logger_1 = __importDefault(require("../logger"));
const bullmq_2 = require("bullmq");
class QueueService {
    static getQueue(queueName) {
        return __awaiter(this, void 0, void 0, function* () {
            let queue = this.queues.get(queueName);
            if (!queue) {
                this.queueOptions = yield redis_adapter_1.RedisAdapter.getQueueOptions();
                queue = new bullmq_1.Queue(queueName, { connection: this.queueOptions });
                queue.on('error', (error) => {
                    logger_1.default.error(`Error process queue`, { error, queueName });
                });
                this.queues.set(queueName, queue);
            }
            return queue;
        });
    }
    static closeAllQueues() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            this.queues.forEach((queue) => {
                promises.push(queue.close());
            });
            yield Promise.all(promises);
            this.queues.clear();
            logger_1.default.info('All queues have been closed successfully');
        });
    }
    static cleanQueues() {
        return __awaiter(this, arguments, void 0, function* (type = 'completed', grace = 0) {
            const promises = [];
            this.queues.forEach((queue) => {
                promises.push(queue.clean(grace, 1000, type));
            });
            yield Promise.all(promises);
            logger_1.default.info('All queues have been cleaned');
        });
    }
    static createWorker(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.queueOptions) {
                this.queueOptions = yield redis_adapter_1.RedisAdapter.getQueueOptions();
            }
            return new bullmq_2.Worker(opts.queueName, opts.processor, Object.assign({ connection: this.queueOptions.connection }, (opts.options || {})));
        });
    }
}
exports.QueueService = QueueService;
QueueService.queues = new Map();
