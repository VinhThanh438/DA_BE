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
exports.UpdateInvoiceDataJob = void 0;
const base_job_1 = require("./base.job");
const job_constant_1 = require("../../config/job.constant");
const logger_1 = __importDefault(require("../../common/logger"));
const invoice_service_1 = require("../../common/services/invoice.service");
class UpdateInvoiceDataJob extends base_job_1.BaseJob {
    constructor() {
        super();
        this.queueName = job_constant_1.UPDATE_INVOICE_DATA_JOB;
        this.invoiceService = invoice_service_1.InvoiceService.getInstance();
    }
    static getInstance() {
        return new UpdateInvoiceDataJob();
    }
    handler(job) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Processing job: ${this.queueName}`);
                yield this.invoiceService.updateInvoiceTotal(job.data);
                logger_1.default.info(`Job processed successfully: ${this.queueName}`);
            }
            catch (error) {
                logger_1.default.error(`Error processing job ${this.queueName}: `, error);
            }
        });
    }
}
exports.UpdateInvoiceDataJob = UpdateInvoiceDataJob;
