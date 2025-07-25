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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanEvent = void 0;
const eventbus_1 = __importDefault(require("../eventbus"));
const logger_1 = __importDefault(require("../logger"));
const loan_service_1 = require("../services/loan.service");
const queue_service_1 = require("../services/queue.service");
const event_constant_1 = require("../../config/event.constant");
const job_constant_1 = require("../../config/job.constant");
class LoanEvent {
    /**
     * Register Loan event
     */
    static register() {
        this.loanService = loan_service_1.LoanService.getInstance();
        eventbus_1.default.on(event_constant_1.EVENT_PAYMENT_CREATED, this.paymentCreatedHandler.bind(this));
        eventbus_1.default.on(event_constant_1.EVENT_UPDATE_LOAN, this.updateLoanInfo.bind(this));
        eventbus_1.default.on(event_constant_1.EVENT_INTEREST_LOG_PAID, this.interestLogPaidHandler.bind(this));
        eventbus_1.default.on(event_constant_1.EVENT_LOAN_PAID, this.loanPaidHandler.bind(this));
    }
    static paymentCreatedHandler(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { payment_request_detail_id } = data;
                if (payment_request_detail_id) {
                    yield (yield queue_service_1.QueueService.getQueue(job_constant_1.HANDLE_LOAN_PAYMENT_JOB)).add(job_constant_1.HANDLE_LOAN_PAYMENT_JOB, data);
                }
                else {
                    logger_1.default.warn('LoanEvent.paymentCreatedHandler: No payment request details found.');
                }
            }
            catch (error) {
                logger_1.default.error('LoanEvent.paymentCreatedHandler:', error);
            }
        });
    }
    static updateLoanInfo(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = data.orderId;
                const invoiceId = data.invoiceId;
                yield this.loanService.addInvoiceInfo(orderId, invoiceId);
                logger_1.default.warn('LoanEvent.updateLoanInfo: loan updated successfully.');
            }
            catch (error) {
                logger_1.default.error('LoanEvent.updateLoanInfo:', error);
            }
        });
    }
    static interestLogPaidHandler(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.loanService.updateInterestLogStatus(data.interestLogId, data.isPaymented);
            }
            catch (error) {
                logger_1.default.error('LoanEvent.interestLogPaidHandler:', error);
            }
        });
    }
    static loanPaidHandler(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { loan_id, amount } = data, rest = __rest(data, ["loan_id", "amount"]);
                yield this.loanService.processLoanPayment({
                    loan_id: Number(data.loan_id),
                    amount: Number(data.amount),
                    paymentData: rest,
                });
            }
            catch (error) {
                logger_1.default.error('LoanEvent.loanPaidHandler:', error);
            }
        });
    }
}
exports.LoanEvent = LoanEvent;
