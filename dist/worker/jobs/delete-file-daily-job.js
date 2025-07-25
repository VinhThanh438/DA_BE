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
exports.DeleteFileDailyJob = void 0;
const logger_1 = __importDefault(require("../../common/logger"));
const queue_service_1 = require("../../common/services/queue.service");
const base_job_1 = require("./base.job");
const app_constant_1 = require("../../config/app.constant");
const job_constant_1 = require("../../config/job.constant");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const UPLOAD_DIR = path_1.default.join(__dirname, `../../../${app_constant_1.PrefixFilePath}`);
const FILE_EXTENSIONS = ['.xlsx', '.xls', '.pdf'];
class DeleteFileDailyJob extends base_job_1.BaseJob {
    constructor() {
        super();
        this.queueName = job_constant_1.DAILY_FILE_CLEANUP_JOB;
    }
    static getInstance() {
        return new DeleteFileDailyJob();
    }
    register() {
        const _super = Object.create(null, {
            register: { get: () => super.register }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.register.call(this);
            const queue = yield queue_service_1.QueueService.getQueue(this.queueName);
            const jobOpts = {
                jobId: this.queueName,
                repeat: {
                    // cron: '* * * * *', // mỗi phút (test)
                    cron: '0 3 * * *', // 3:00 AM mỗi ngày
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
                const files = yield fs_1.promises.readdir(UPLOAD_DIR);
                for (const file of files) {
                    if (FILE_EXTENSIONS.some((ext) => file.endsWith(ext))) {
                        const filePath = path_1.default.join(UPLOAD_DIR, file);
                        try {
                            yield fs_1.promises.unlink(filePath);
                            logger_1.default.info(`Deleted file: ${filePath}`);
                        }
                        catch (err) {
                            logger_1.default.error(`Failed to delete file: ${filePath}`, err);
                        }
                    }
                }
                logger_1.default.info(`Job processed successfully: ${this.queueName}`);
            }
            catch (error) {
                logger_1.default.error(`Error processing job ${this.queueName}: `, error);
            }
        });
    }
}
exports.DeleteFileDailyJob = DeleteFileDailyJob;
