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
exports.InvoiceEvent = void 0;
const eventbus_1 = __importDefault(require("../eventbus"));
const logger_1 = __importDefault(require("../logger"));
const queue_service_1 = require("../services/queue.service");
const event_constant_1 = require("../../config/event.constant");
const job_constant_1 = require("../../config/job.constant");
class InvoiceEvent {
    /**
     * Register Loan event
     */
    static register() {
        eventbus_1.default.on(event_constant_1.EVENT_INVOICE_CREATED, this.invoiceCreatedHandler.bind(this));
    }
    static invoiceCreatedHandler(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (yield queue_service_1.QueueService.getQueue(job_constant_1.UPDATE_INVOICE_DATA_JOB)).add(job_constant_1.UPDATE_INVOICE_DATA_JOB, data);
                logger_1.default.warn('InvoiceEvent.handler: invoice updated successfully.');
            }
            catch (error) {
                logger_1.default.error('InvoiceEvent.handler:', error);
            }
        });
    }
}
exports.InvoiceEvent = InvoiceEvent;
