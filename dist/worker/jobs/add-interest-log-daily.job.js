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
exports.AddInterestLogsDailyJob = void 0;
const logger_1 = __importDefault(require("../../common/logger"));
const queue_service_1 = require("../../common/services/queue.service");
const loan_service_1 = require("../../common/services/loan.service");
const base_job_1 = require("./base.job");
const job_constant_1 = require("../../config/job.constant");
const app_constant_1 = require("../../config/app.constant");
class AddInterestLogsDailyJob extends base_job_1.BaseJob {
    constructor() {
        super();
        this.queueName = job_constant_1.ADD_INTEREST_LOGS_DAILY_JOB;
        this.loanService = loan_service_1.LoanService.getInstance();
    }
    static getInstance() {
        return new AddInterestLogsDailyJob();
    }
    register() {
        const _super = Object.create(null, {
            register: { get: () => super.register }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.register.call(this);
            const queue = yield queue_service_1.QueueService.getQueue(this.queueName);
            const jobOpts = {
                jobId: job_constant_1.ADD_INTEREST_LOGS_DAILY_JOB,
                repeat: {
                    // cron: '* * * * *', // Mỗi phút
                    cron: '1 0 0 * * *', // 0:00:01 AM mỗi ngày
                    tz: app_constant_1.DEFAULT_TIME_ZONE,
                },
            };
            yield this.clearOldCronJobs(queue);
            yield queue.add(this.queueName, { job: this.queueName }, jobOpts);
            return this;
        });
    }
    handler(job) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Processing job: ${this.queueName}`);
                yield this.loanService.autoCreateInterestLogsEverySingleDay();
                logger_1.default.info(`Job processed successfully: ${this.queueName}`);
            }
            catch (error) {
                logger_1.default.error(`Error processing job ${this.queueName}: `, error);
            }
        });
    }
}
exports.AddInterestLogsDailyJob = AddInterestLogsDailyJob;
