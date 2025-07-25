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
exports.LoanService = void 0;
const base_service_1 = require("./master/base.service");
const loan_repo_1 = require("../repositories/loan.repo");
const partner_repo_1 = require("../repositories/partner.repo");
const organization_repo_1 = require("../repositories/organization.repo");
const invoice_repo_1 = require("../repositories/invoice.repo");
const order_repo_1 = require("../repositories/order.repo");
const transform_util_1 = require("../helpers/transform.util");
const time_adapter_1 = require("../infrastructure/time.adapter");
const interest_log_repo_1 = require("../repositories/interest-log.repo");
const handle_files_1 = require("../helpers/handle-files");
const canculate_interest_amount_helper_1 = require("../helpers/canculate-interest-amount.helper");
const payment_request_details_repo_1 = require("../repositories/payment-request-details.repo");
const payment_repo_1 = require("../repositories/payment.repo");
const logger_1 = __importDefault(require("../logger"));
const app_constant_1 = require("../../config/app.constant");
const payment_request_repo_1 = require("../repositories/payment-request.repo");
const bank_repo_1 = require("../repositories/bank.repo");
const moment_1 = __importDefault(require("moment"));
const transaction_repo_1 = require("../repositories/transaction.repo");
const event_constant_1 = require("../../config/event.constant");
const eventbus_1 = __importDefault(require("../eventbus"));
class LoanService extends base_service_1.BaseService {
    constructor() {
        super(new loan_repo_1.LoanRepo());
        this.partnerRepo = new partner_repo_1.PartnerRepo();
        this.bankRepo = new bank_repo_1.BankRepo();
        this.organizationRepo = new organization_repo_1.OrganizationRepo();
        this.orderRepo = new order_repo_1.OrderRepo();
        this.paymentRepo = new payment_repo_1.PaymentRepo();
        this.invoiceRepo = new invoice_repo_1.InvoiceRepo();
        this.interestLogRepo = new interest_log_repo_1.InterestLogRepo();
        this.paymentRequestDetailRepo = new payment_request_details_repo_1.PaymentRequestDetailRepo();
        this.paymentRequestRepo = new payment_request_repo_1.PaymentRequestRepo();
        this.transactionRepo = new transaction_repo_1.TransactionRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new LoanService();
        }
        return this.instance;
    }
    generateAutoInterestSchedule(loan) {
        const rows = [];
        let currentDebt = loan.amount;
        const disbursementDate = time_adapter_1.TimeAdapter.parse(loan.disbursement_date);
        const endDate = time_adapter_1.TimeAdapter.parse(time_adapter_1.TimeAdapter.getCurrentDate());
        const paymentDay = loan.payment_day;
        let closingDate = disbursementDate.clone().date(paymentDay);
        if (disbursementDate.isAfter(closingDate)) {
            closingDate = closingDate.add(1, 'month');
        }
        const sortedLogs = [...(loan.interest_logs || [])].sort((a, b) => time_adapter_1.TimeAdapter.parse(a.time_at).valueOf() - time_adapter_1.TimeAdapter.parse(b.time_at).valueOf());
        let currentDate = disbursementDate.clone();
        while (closingDate.isSameOrBefore(endDate)) {
            const payment = sortedLogs.find((p) => {
                const paymentDate = time_adapter_1.TimeAdapter.parse(p.time_at);
                return paymentDate.isAfter(currentDate) && paymentDate.isSameOrBefore(closingDate);
            });
            const rawClosingDate = payment ? time_adapter_1.TimeAdapter.parse(payment.time_at) : closingDate.clone();
            const actualClosingDate = rawClosingDate.clone().add(1, 'day');
            const interestDays = actualClosingDate.diff(currentDate, 'day');
            const interestAmount = (0, canculate_interest_amount_helper_1.calculateInterestAmount)(Number(currentDebt), Number(loan.interest_rate), interestDays);
            rows.push(Object.assign(Object.assign({ loan_id: loan.id }, (loan.organization_id != null ? { organization_id: loan.organization_id } : {})), { debt_before_payment: Number(currentDebt), time_at: actualClosingDate.toDate(), interest_rate: loan.interest_rate, interest_days: interestDays, interest_amount: interestAmount }));
            currentDate = actualClosingDate.clone();
            closingDate = closingDate.clone().add(1, 'month');
        }
        return rows;
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (query.bank) {
                query.keyword = query.bank;
                delete query.bank;
            }
            const result = yield this.repo.paginate(query, true);
            let totalInterestAmount = 0;
            let totalPaymentAmount = 0;
            let totalCurrentDebt = 0;
            result.data = yield Promise.all(result.data.map((loan) => __awaiter(this, void 0, void 0, function* () {
                if (!loan)
                    return loan;
                let interestLogs = Array.isArray(loan.interest_logs) ? [...loan.interest_logs] : [];
                const today = time_adapter_1.TimeAdapter.now().startOf('day');
                if (interestLogs.length > 0) {
                    interestLogs.sort((a, b) => {
                        const timeA = new Date(a.time_at || 0).getTime();
                        const timeB = new Date(b.time_at || 0).getTime();
                        return timeA - timeB;
                    });
                    const defaultDebt = Number(loan.current_debt) || 0;
                    const defaultRate = Number(loan.interest_rate) || 0;
                    const lastInterestLog = interestLogs[interestLogs.length - 1];
                    const interestDay = time_adapter_1.TimeAdapter.getDistanceToNearestPastDay(time_adapter_1.TimeAdapter.parseToDate(today.toISOString()), lastInterestLog.time_at);
                    const interestAmount = (0, canculate_interest_amount_helper_1.calculateInterestAmount)(Number(lastInterestLog.debt_before_payment), Number(loan.interest_rate), interestDay);
                    interestLogs.push({
                        time_at: '',
                        interest_days: interestDay,
                        interest_amount: interestAmount,
                        debt_before_payment: defaultDebt,
                        interest_rate: defaultRate,
                        amount: 0,
                    });
                    totalCurrentDebt += defaultDebt;
                    const lastPayment = interestLogs[interestLogs.length - 1];
                    for (let log of interestLogs) {
                        totalInterestAmount += Number(log.interest_amount) || 0;
                        totalPaymentAmount += Number(log.amount) || 0;
                        if (log.is_paymented) {
                            let payment = null;
                            const paymentRequestDetail = yield this.paymentRequestDetailRepo.findOne({
                                interest_log_id: log.id,
                            });
                            if (paymentRequestDetail) {
                                payment = yield this.paymentRepo.findOne({
                                    payment_request_detail_id: paymentRequestDetail.id,
                                });
                            }
                            else {
                                payment = yield this.paymentRepo.findOne({
                                    interest_log_id: log.id,
                                });
                            }
                            log = payment ? Object.assign(log, { payment }) : log;
                        }
                    }
                    const lastDate = time_adapter_1.TimeAdapter.parse(lastPayment.time_at).startOf('day');
                    if (today.isAfter(lastDate)) {
                        const interestDays = today.diff(lastDate, 'day');
                        const interestAmount = (0, canculate_interest_amount_helper_1.calculateInterestAmount)(Number(lastPayment.debt_before_payment), Number(lastPayment.interest_rate), interestDays);
                        totalInterestAmount += interestAmount;
                        totalCurrentDebt += Number(lastPayment.debt_before_payment) || 0;
                        interestLogs.push(Object.assign(Object.assign({}, lastPayment), { amount: 0, time_at: '', interest_days: interestDays, interest_amount: interestAmount }));
                    }
                }
                else {
                    const lastDate = time_adapter_1.TimeAdapter.parse(loan.disbursement_date).startOf('day');
                    const interestDays = today.diff(lastDate, 'day');
                    const interestAmount = (0, canculate_interest_amount_helper_1.calculateInterestAmount)(Number(loan.current_debt), Number(loan.interest_rate), interestDays);
                    totalInterestAmount += interestAmount;
                    totalCurrentDebt += Number(loan.current_debt) || 0;
                    interestLogs.push({
                        debt_before_payment: Number(loan.current_debt),
                        interest_rate: loan.interest_rate,
                        amount: 0,
                        time_at: '',
                        interest_days: interestDays,
                        interest_amount: interestAmount,
                    });
                }
                return Object.assign(Object.assign({}, loan), { interest_logs: interestLogs });
            })));
            result.summary = {
                total_amount: 12052003,
                total_payment_amount: totalPaymentAmount,
                total_current_debt: totalCurrentDebt,
                total_interest_amount: totalInterestAmount,
            };
            return (0, transform_util_1.transformDecimal)(result);
        });
    }
    create(request, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield this.validateForeignKeys(request, {
                partner_id: this.partnerRepo,
                invoice_id: this.invoiceRepo,
                order_id: this.orderRepo,
                organization_id: this.organizationRepo,
                bank_id: this.bankRepo,
            }, tx);
            const { order, bank_id, order_id, invoice_id } = request, rest = __rest(request, ["order", "bank_id", "order_id", "invoice_id"]);
            rest.current_debt = rest.amount;
            const loanId = yield this.repo.create(Object.assign(Object.assign(Object.assign(Object.assign({}, rest), (bank_id && { bank: { connect: { id: bank_id } } })), (order_id && { order: { connect: { id: order_id } } })), (invoice_id && { invoice: { connect: { id: invoice_id } } })));
            // Create transaction
            const transactionOUT = {
                time_at: (0, moment_1.default)().toISOString(),
                amount: Number(request.amount),
                type: app_constant_1.TransactionType.OUT,
                organization_id: request.organization_id,
                order_type: app_constant_1.TransactionOrderType.LOAN,
                partner: ((_a = request.order) === null || _a === void 0 ? void 0 : _a.partner_id) ? { connect: { id: (_b = request.order) === null || _b === void 0 ? void 0 : _b.partner_id } } : undefined,
                order: request.order_id ? { connect: { id: request.order_id } } : undefined,
                invoice: request.invoice_id ? { connect: { id: request.invoice_id } } : undefined,
                loan: loanId ? { connect: { id: loanId } } : undefined,
            };
            yield this.transactionRepo.create(transactionOUT, tx);
            if (loanId) {
                const loan = yield this.repo.findOne({ id: loanId }, false, tx);
                const interestLogs = this.generateAutoInterestSchedule(loan);
                yield this.interestLogRepo.createMany(interestLogs, tx);
            }
            return { id: loanId };
        });
    }
    approve(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const loanData = yield this.validateStatusApprove(id);
            const { files } = body, restData = __rest(body, ["files"]);
            let dataToUpdate = Object.assign({}, restData);
            if (files && files.length > 0) {
                let filesUpdate = (0, handle_files_1.handleFiles)(files, [], loanData.files || []);
                dataToUpdate.files = filesUpdate;
            }
            const updatedId = yield this.repo.update({ id }, dataToUpdate);
            eventbus_1.default.emit(event_constant_1.EVENT_LOAN_CREATED, loanData);
            return { id: updatedId };
        });
    }
    autoCreateInterestLogsEverySingleDay() {
        return __awaiter(this, void 0, void 0, function* () {
            const loans = yield this.repo.findMany();
            for (const loan of loans) {
                const lastInterestLogRecord = yield this.interestLogRepo.findFirst({ loan_id: loan.id });
                if (lastInterestLogRecord) {
                    const currentDate = time_adapter_1.TimeAdapter.getCurrentDate();
                    const currentDay = time_adapter_1.TimeAdapter.getDayOfMonth(currentDate);
                    if (currentDay === Number(loan.payment_day) + 1) {
                        const interestDays = time_adapter_1.TimeAdapter.getDistanceToNearestPastDay(currentDate, lastInterestLogRecord.time_at);
                        const interestAmount = (0, canculate_interest_amount_helper_1.calculateInterestAmount)(Number(loan.current_debt), Number(loan.interest_rate), interestDays);
                        yield this.interestLogRepo.create({
                            loan_id: loan.id,
                            debt_before_payment: loan.current_debt,
                            time_at: currentDate,
                            interest_rate: loan.interest_rate,
                            interest_days: interestDays,
                            interest_amount: interestAmount,
                        });
                    }
                }
            }
        });
    }
    updateCurrentDebt(loanId, currentDebt, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const newCurrentDebt = currentDebt - amount;
            yield this.repo.update({ id: loanId }, {
                current_debt: newCurrentDebt,
            });
        });
    }
    handleLoanPayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { payment_request_detail_id } = data, paymentData = __rest(data, ["payment_request_detail_id"]);
                const paymentRequestDetail = yield this.paymentRequestDetailRepo.findOne({
                    id: payment_request_detail_id,
                });
                if (!paymentRequestDetail) {
                    throw new Error('No payment request details found.');
                }
                const paymentRequest = yield this.paymentRequestRepo.findOne({
                    id: Number(paymentRequestDetail.payment_request_id),
                });
                const loan = yield this.repo.findOne({ id: Number(paymentRequestDetail.loan_id) });
                const { loan_id, interest_log_id } = paymentRequestDetail;
                if ((paymentRequest === null || paymentRequest === void 0 ? void 0 : paymentRequest.type) === app_constant_1.PaymentRequestType.LOAN && loan && loan_id) {
                    yield this.processLoanPayment({
                        loan_id,
                        amount: Number(paymentRequestDetail.amount),
                        paymentData,
                    });
                }
                else if ((paymentRequest === null || paymentRequest === void 0 ? void 0 : paymentRequest.type) === app_constant_1.PaymentRequestType.INTEREST && interest_log_id) {
                    eventbus_1.default.emit(event_constant_1.EVENT_INTEREST_LOG_PAID, {
                        id: interest_log_id,
                        isPaymented: true,
                    });
                }
                else {
                    throw new Error('cannot do something: lost info');
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    processLoanPayment(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { loan_id, amount, paymentData } = params;
            const interestLastRecord = yield this.interestLogRepo.findFirst({ loan_id: Number(loan_id) });
            const loan = yield this.repo.findOne({ id: Number(loan_id) });
            if (!interestLastRecord) {
                throw new Error('interest log records not found!');
            }
            const distance = time_adapter_1.TimeAdapter.getDistanceToNearestPastDay(paymentData.time_at, interestLastRecord.time_at);
            const interestAmount = (0, canculate_interest_amount_helper_1.calculateInterestAmount)(Number(loan === null || loan === void 0 ? void 0 : loan.current_debt), Number(interestLastRecord === null || interestLastRecord === void 0 ? void 0 : interestLastRecord.interest_rate), distance);
            const interestLogCreateData = {
                loan: { connect: { id: loan_id } },
                organization: paymentData.organization,
                debt_before_payment: Number(loan === null || loan === void 0 ? void 0 : loan.current_debt),
                time_at: paymentData.payment_date,
                interest_rate: loan === null || loan === void 0 ? void 0 : loan.interest_rate,
                interest_days: distance,
                interest_amount: interestAmount,
                amount,
            };
            const newInterestLogId = yield this.interestLogRepo.create(interestLogCreateData);
            if (newInterestLogId) {
                yield this.updateCurrentDebt(Number(loan_id), Number(loan === null || loan === void 0 ? void 0 : loan.current_debt), amount);
            }
            logger_1.default.info(`Job: interest log created successfully!, id: ${newInterestLogId}`);
        });
    }
    updateInterestLogStatus(id, isPaymented) {
        return __awaiter(this, void 0, void 0, function* () {
            const interestLog = yield this.interestLogRepo.findOne({ id });
            if (!interestLog) {
                throw new Error('Interest log not found!');
            }
            const updatedId = yield this.interestLogRepo.update({ id }, {
                is_paymented: isPaymented,
            });
            logger_1.default.info(`Job: interest log updated successfully!, id: ${updatedId}`);
        });
    }
    addInvoiceInfo(orderId, invoiceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const loan = yield this.repo.findOne({ order_id: orderId });
            if (!loan) {
                logger_1.default.error('LoanEvent.addInvoiceInfo: Loan not found for order ID:', orderId);
                return;
            }
            if (loan.invoice_id) {
                logger_1.default.info('LoanEvent.addInvoiceInfo: Invoice already exists for this loan.');
                return;
            }
            yield this.repo.update({ id: loan.id }, {
                invoice: { connect: { id: invoiceId } },
            });
        });
    }
}
exports.LoanService = LoanService;
