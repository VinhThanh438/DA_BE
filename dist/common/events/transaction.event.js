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
exports.TransactionEvent = void 0;
const eventbus_1 = __importDefault(require("../eventbus"));
const logger_1 = __importDefault(require("../logger"));
const interest_log_repo_1 = require("../repositories/interest-log.repo");
const invoice_repo_1 = require("../repositories/invoice.repo");
const loan_repo_1 = require("../repositories/loan.repo");
const order_repo_1 = require("../repositories/order.repo");
const transaction_repo_1 = require("../repositories/transaction.repo");
const invoice_service_1 = require("../services/invoice.service");
const transaction_service_1 = require("../services/transaction.service");
const app_constant_1 = require("../../config/app.constant");
const event_constant_1 = require("../../config/event.constant");
class TransactionEvent {
    static register() {
        this.transactionService = transaction_service_1.TransactionService.getInstance();
        this.invoiceService = invoice_service_1.InvoiceService.getInstance();
        this.invoiceRepo = new invoice_repo_1.InvoiceRepo();
        this.orderRepo = new order_repo_1.OrderRepo();
        this.loanRepo = new loan_repo_1.LoanRepo();
        this.interestLogRepo = new interest_log_repo_1.InterestLogRepo();
        this.transactionRepo = new transaction_repo_1.TransactionRepo();
        eventbus_1.default.on(event_constant_1.EVENT_PAYMENT_CREATED, this.paymentCreatedHandler.bind(this));
        eventbus_1.default.on(event_constant_1.EVENT_LOAN_CREATED, this.loanCreatedHandler.bind(this));
    }
    static paymentCreatedHandler(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { new_bank_balance, bank_id, payment_request_detail_id, interest_log_id, order_type } = data, transactionData = __rest(data, ["new_bank_balance", "bank_id", "payment_request_detail_id", "interest_log_id", "order_type"]);
                if (payment_request_detail_id) {
                    const transaction = yield this.transactionService.createTransactionByPaymentRequestDetail(payment_request_detail_id, transactionData);
                    logger_1.default.info('TransactionEvent.paymentCreatedHandler: transaction created successfully');
                    if (transaction && transaction.invoice_id) {
                        const invoice = yield this.invoiceRepo.findOne({ id: transaction.invoice_id }, true);
                        if (invoice) {
                            const totalInvoice = yield this.invoiceService.attachPaymentInfoToOrder(invoice);
                            if (totalInvoice.total_amount_debt && totalInvoice.total_amount_debt <= 0) {
                                // Update invoice status to PAID if total amount debt is 0 or less
                                yield this.invoiceRepo.update({ id: invoice.id }, { is_payment_completed: true });
                                logger_1.default.info('TransactionEvent.paymentCreatedHandler: invoice status updated to PAID');
                            }
                            const totalInvoiceDebt = yield this.invoiceService.attachPaymentInfoToOrder(invoice);
                            yield this.invoiceRepo.update({ id: invoice.id }, {
                                total_amount_paid: totalInvoiceDebt.total_amount_paid,
                                total_amount_debt: totalInvoiceDebt.total_amount_debt,
                                total_commission_paid: totalInvoiceDebt.total_commission_paid,
                                total_commission_debt: totalInvoiceDebt.total_commission_debt,
                            });
                            logger_1.default.info('TransactionEvent.paymentCreatedHandler: debt updated successfully.');
                        }
                    }
                }
                else if (interest_log_id) {
                    const interestLog = yield this.interestLogRepo.findOne({ id: interest_log_id }, true);
                    if (!interestLog) {
                        logger_1.default.warn('TransactionEvent.paymentCreatedHandler: Interest log not found.');
                        return;
                    }
                    const loan = yield this.loanRepo.findOne({ id: interestLog.loan_id }, true);
                    if (!loan) {
                        logger_1.default.warn('TransactionEvent.paymentCreatedHandler: Loan not found.');
                        return;
                    }
                    const transactionDataWithInterest = Object.assign(Object.assign({}, transactionData), { type: app_constant_1.TransactionType.OUT, order_type, bank: bank_id ? { connect: { id: bank_id } } : undefined, invoice: loan.invoice_id ? { connect: { id: loan.invoice_id } } : undefined, order: loan.order_id ? { connect: { id: loan.order_id } } : undefined, partner: loan.partner_id ? { connect: { id: loan.partner_id } } : undefined, loan: loan ? { connect: { id: loan.id } } : undefined });
                    yield this.transactionRepo.create(transactionDataWithInterest);
                    eventbus_1.default.emit(event_constant_1.EVENT_INTEREST_LOG_PAID, {
                        interestLogId: interestLog.id,
                        isPaymented: true,
                    });
                    logger_1.default.info('TransactionEvent.paymentCreatedHandler: interest transaction created successfully.');
                }
                else {
                    const transactionDateWithBank = {
                        type: app_constant_1.TransactionType.IN,
                        order_type: app_constant_1.TransactionOrderType.ORDER,
                        time_at: transactionData.time_at,
                        amount: data.amount,
                        organization_id: data.organization_id,
                        order: data.order,
                        invoice: data.invoice,
                        partner: data.partner,
                        bank: data.bank,
                        payment: data.payment,
                        note: data.note,
                    };
                    const transactionId = yield this.transactionRepo.create(transactionDateWithBank);
                    logger_1.default.warn('TransactionEvent.paymentCreatedHandler: successfully with id: ', transactionId);
                }
            }
            catch (error) {
                logger_1.default.error('TransactionEvent.paymentCreatedHandler:', error);
            }
        });
    }
    static loanCreatedHandler(loan) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { order_id, invoice_id, amount } = loan;
                const order = yield this.orderRepo.findOne({ id: Number(order_id) });
                const transactionData = {
                    order_id: order_id ? order_id : undefined,
                    invoice_id: invoice_id ? invoice_id : undefined,
                    amount: Number(amount),
                    partner_id: Number(order === null || order === void 0 ? void 0 : order.partner_id),
                    type: app_constant_1.TransactionType.OUT,
                    order_type: app_constant_1.TransactionOrderType.LOAN,
                    organization_id: Number(order === null || order === void 0 ? void 0 : order.organization_id),
                };
                yield this.transactionService.create(transactionData);
                logger_1.default.info('TransactionEvent.loanCreatedHandler: transaction created successfully.');
            }
            catch (error) {
                logger_1.default.error('TransactionEvent.loanCreatedHandler:', error);
            }
        });
    }
}
exports.TransactionEvent = TransactionEvent;
