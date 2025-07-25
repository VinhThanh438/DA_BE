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
exports.PaymentService = void 0;
const base_service_1 = require("./master/base.service");
const payment_repo_1 = require("../repositories/payment.repo");
const payment_request_repo_1 = require("../repositories/payment-request.repo");
const handle_files_1 = require("../helpers/handle-files");
const app_constant_1 = require("../../config/app.constant");
const order_repo_1 = require("../repositories/order.repo");
const invoice_repo_1 = require("../repositories/invoice.repo");
const bank_repo_1 = require("../repositories/bank.repo");
const eventbus_1 = __importDefault(require("../eventbus"));
const event_constant_1 = require("../../config/event.constant");
const organization_repo_1 = require("../repositories/organization.repo");
const transaction_repo_1 = require("../repositories/transaction.repo");
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const transform_util_1 = require("../helpers/transform.util");
const time_adapter_1 = require("../infrastructure/time.adapter");
const payment_request_details_repo_1 = require("../repositories/payment-request-details.repo");
class PaymentService extends base_service_1.BaseService {
    constructor() {
        super(new payment_repo_1.PaymentRepo());
        this.paymentRequestRepo = new payment_request_repo_1.PaymentRequestRepo();
        this.paymentRequestDetailRepo = new payment_request_details_repo_1.PaymentRequestDetailRepo();
        this.orderRepo = new order_repo_1.OrderRepo();
        this.invoiceRepo = new invoice_repo_1.InvoiceRepo();
        this.bankRepo = new bank_repo_1.BankRepo();
        this.transactionRepo = new transaction_repo_1.TransactionRepo();
        this.organizationRepo = new organization_repo_1.OrganizationRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PaymentService();
        }
        return this.instance;
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, size = 20, keyword, startAt, endAt } = query, filterConditions = __rest(query, ["page", "size", "keyword", "startAt", "endAt"]);
            if (keyword) {
                filterConditions.OR = [
                    { note: { contains: keyword, mode: 'insensitive' } },
                    { description: { contains: keyword, mode: 'insensitive' } },
                ];
            }
            if (startAt || endAt) {
                filterConditions.payment_date = {};
                if (startAt) {
                    filterConditions.payment_date.gte = startAt;
                }
                if (endAt) {
                    filterConditions.payment_date.lte = endAt;
                }
            }
            // Get all payments matching the filter conditions
            const allPayments = yield this.repo.findMany(filterConditions, true);
            // Calculate summary totals from ALL filtered data
            let total_income = 0;
            let total_expense = 0;
            allPayments.forEach((payment) => {
                const amount = Number(payment.amount || 0);
                if (payment.type === app_constant_1.PaymentType.INCOME) {
                    total_income += amount;
                }
                else {
                    total_expense += amount;
                }
            });
            // Thực hiện phân trang thủ công
            const result = this.manualPaginate(allPayments, page, size);
            return Object.assign(Object.assign({}, result), { summary: {
                    total_income,
                    total_expense,
                } });
        });
    }
    createPayment(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                yield this.validateForeignKeys(request, {
                    payment_request_detail_id: this.paymentRequestDetailRepo,
                    order_id: this.orderRepo,
                    invoice_id: this.invoiceRepo,
                    bank_id: this.bankRepo,
                    organization_id: this.organizationRepo,
                });
                const { id, payment_request_detail_id, order_id, invoice_id, bank_id, organization_id, category, interest_log_id, loan_id } = request, paymentData = __rest(request, ["id", "payment_request_detail_id", "order_id", "invoice_id", "bank_id", "organization_id", "category", "interest_log_id", "loan_id"]);
                let bank = null;
                if (bank_id) {
                    bank = yield this.bankRepo.findOne({ id: bank_id });
                    if (bank &&
                        bank.balance != null &&
                        ((_a = paymentData.amount) !== null && _a !== void 0 ? _a : 0) > Number(bank.balance) &&
                        request.type === app_constant_1.PaymentType.EXPENSE) {
                        throw new api_error_1.APIError({
                            message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                            status: errors_1.ErrorCode.BAD_REQUEST,
                            errors: [`bank_id.${errors_1.ErrorKey.INVALID}`],
                        });
                    }
                }
                const paymentRequestDetail = yield this.paymentRequestDetailRepo.findOne({ id: payment_request_detail_id });
                if (payment_request_detail_id && !paymentRequestDetail) {
                    throw new api_error_1.APIError({
                        message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: [`payment_request_detail.${errors_1.ErrorKey.NOT_FOUND}`],
                    });
                }
                const paymentRequest = yield this.paymentRequestRepo.findOne({
                    id: paymentRequestDetail === null || paymentRequestDetail === void 0 ? void 0 : paymentRequestDetail.payment_request_id,
                });
                if (!paymentRequest) {
                    throw new api_error_1.APIError({
                        message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: [`payment_request.${errors_1.ErrorKey.INVALID}`],
                    });
                }
                const partnerId = paymentRequest ? paymentRequest.partner_id : undefined;
                const mappedData = this.autoMapConnection([paymentData], {
                    partner_id: partnerId,
                });
                let resultId;
                if (request.type === app_constant_1.PaymentType.INCOME) {
                    const { category } = request, rest = __rest(request, ["category"]);
                    const mappedData = this.autoMapConnection([rest]);
                    resultId = yield this.repo.create(mappedData[0]);
                }
                else {
                    resultId = yield this.repo.create(mappedData[0]);
                }
                if (resultId) {
                    const eventData = {
                        order_type: category || undefined,
                        note: request.description,
                        new_bank_balance: request.type === app_constant_1.PaymentType.EXPENSE
                            ? Number(bank === null || bank === void 0 ? void 0 : bank.balance) - Number(request.amount)
                            : Number(bank === null || bank === void 0 ? void 0 : bank.balance) + Number(request.amount),
                        amount: request.amount,
                        bank_id: request.bank_id,
                        interest_log_id: interest_log_id,
                        bank: request.bank_id ? { connect: { id: request.bank_id } } : undefined,
                        payment: { connect: { id: resultId } },
                        type: request.type && request.type === app_constant_1.PaymentType.INCOME
                            ? app_constant_1.TransactionType.IN
                            : app_constant_1.TransactionType.OUT,
                        description: request.note,
                        invoice: request.invoice_id ? { connect: { id: request.invoice_id } } : undefined,
                        invoice_id: request.invoice_id,
                        payment_id: resultId,
                        order_id: request.order_id,
                        partner_id: request === null || request === void 0 ? void 0 : request.partner_id,
                        organization_id: request.organization_id,
                        order: request.order_id ? { connect: { id: request.order_id } } : undefined,
                        partner: (request === null || request === void 0 ? void 0 : request.partner_id) ? { connect: { id: request.partner_id } } : undefined,
                        organization: request.organization_id ? { connect: { id: request.organization_id } } : undefined,
                        time_at: paymentData.payment_date,
                        payment_request_detail_id: request.payment_request_detail_id,
                    };
                    eventbus_1.default.emit(event_constant_1.EVENT_PAYMENT_CREATED, eventData);
                    if (loan_id) {
                        eventbus_1.default.emit(event_constant_1.EVENT_LOAN_PAID, Object.assign(Object.assign({}, paymentData), { loan_id: Number(loan_id), amount: Number(request.amount) }));
                    }
                }
                return { id: resultId };
            }
            catch (error) {
                if ((_b = request.files) === null || _b === void 0 ? void 0 : _b.length) {
                    eventbus_1.default.emit(event_constant_1.EVENT_DELETE_UNUSED_FILES, request.files);
                }
                throw error;
            }
        });
    }
    updatePayment(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { files_add, files_delete } = request, paymentData = __rest(request, ["files_add", "files_delete"]);
            try {
                const paymentExist = yield this.findById(id);
                yield this.validateForeignKeys(request, {
                    payment_request_id: this.paymentRequestRepo,
                    order_id: this.orderRepo,
                    invoice_id: this.invoiceRepo,
                    partner_id: this.repo,
                });
                // handle files
                let filesUpdate = (0, handle_files_1.handleFiles)(files_add, files_delete, paymentExist === null || paymentExist === void 0 ? void 0 : paymentExist.files);
                yield this.repo.update({ id }, Object.assign(Object.assign({}, paymentData), (filesUpdate !== null && { files: filesUpdate })));
                // clean up file
                if (files_delete && files_delete.length > 0) {
                    eventbus_1.default.emit(event_constant_1.EVENT_DELETE_UNUSED_FILES, files_delete);
                }
                return { id };
            }
            catch (error) {
                if (files_add && files_add.length > 0) {
                    eventbus_1.default.emit(event_constant_1.EVENT_DELETE_UNUSED_FILES, files_add);
                }
                throw error;
            }
        });
    }
    approve(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.validateStatusApprove(id);
            const paymentUpdateId = yield this.repo.update({ id }, body);
            if (paymentUpdateId) {
                const transaction = {
                    amount: payment.amount,
                    bank: payment.bank_id ? { connect: { id: payment.bank_id } } : undefined,
                    payment: { connect: { id } },
                    type: payment.type && payment.type === app_constant_1.PaymentType.INCOME ? app_constant_1.TransactionType.IN : app_constant_1.TransactionType.OUT,
                    invoice: payment.invoice_id ? { connect: { id: payment.invoice_id } } : undefined,
                    order: payment.order_id ? { connect: { id: payment.order_id } } : undefined,
                    partner: payment.partner_id ? { connect: { id: payment.partner_id } } : undefined,
                    organization: payment.organization_id ? { connect: { id: payment.organization_id } } : undefined,
                    payment_request_id: payment.payment_request_id,
                };
                eventbus_1.default.emit(event_constant_1.EVENT_PAYMENT_CREATED, transaction);
            }
            return { id };
        });
    }
    close(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bankId } = request, rest = __rest(request, ["bankId"]);
            const conditions = { bank_id: parseInt(bankId), is_closed: false };
            yield this.transactionRepo.updateManyByCondition(conditions, {
                is_closed: true,
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.repo.findOne({ id });
            if (!payment) {
                throw new api_error_1.APIError({
                    message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`id.${errors_1.ErrorKey.INVALID}`],
                });
            }
            const deletedId = yield this.repo.delete({ id });
            if (deletedId) {
                const refund = payment.amount;
                eventbus_1.default.emit(event_constant_1.EVENT_PAYMENT_DELETED, {
                    bank_id: payment.bank_id,
                    refund,
                    type: payment.type,
                });
            }
            return { id: deletedId };
        });
    }
    report(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startAt, endAt, organization_id } = request;
            const banks = yield this.bankRepo.findMany({ organization_id });
            const result = yield Promise.all(banks.map((bank) => __awaiter(this, void 0, void 0, function* () {
                // Period
                const periodTransactions = yield this.transactionRepo.findMany({
                    time_at: { gte: startAt, lte: endAt },
                    bank_id: bank.id,
                });
                let periodIncrease = 0;
                let periodReduction = 0;
                let beginning = 0;
                let currentBalance = Number(bank.balance);
                for (const tx of periodTransactions) {
                    const amount = Number(tx.amount);
                    if (tx.type === app_constant_1.TransactionType.IN)
                        periodIncrease += amount;
                    else if (tx.type === app_constant_1.TransactionType.OUT)
                        periodReduction += amount;
                }
                if (endAt && time_adapter_1.TimeAdapter.getCurrentDate() > time_adapter_1.TimeAdapter.parseToDate(endAt)) {
                    let endingIncrease = 0;
                    let endingReduction = 0;
                    const endingTransactions = yield this.transactionRepo.findMany({
                        time_at: { gte: time_adapter_1.TimeAdapter.parseToDate(endAt), lte: time_adapter_1.TimeAdapter.getCurrentDate() },
                        bank_id: bank.id,
                    });
                    for (const tx of endingTransactions) {
                        const amount = Number(tx.amount);
                        if (tx.type === app_constant_1.TransactionType.IN)
                            endingIncrease += amount;
                        else if (tx.type === app_constant_1.TransactionType.OUT)
                            endingReduction += amount;
                    }
                    currentBalance -= endingIncrease - endingReduction;
                }
                beginning = currentBalance - (periodIncrease - periodReduction);
                const ending = beginning + periodIncrease - periodReduction;
                return {
                    bank,
                    beginning,
                    increase: periodIncrease,
                    reduction: periodReduction,
                    ending,
                };
            })));
            return (0, transform_util_1.transformDecimal)(result);
        });
    }
    ledger(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startAt, endAt, organization_id, bankId } = request, query = __rest(request, ["startAt", "endAt", "organization_id", "bankId"]);
            const bank = yield this.bankRepo.findOne({ organization_id, id: bankId });
            if (!bank) {
                throw new api_error_1.APIError({
                    message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`bank.${errors_1.ErrorKey.NOT_FOUND}`],
                });
            }
            // beginning
            const currentBalance = Number(bank.balance);
            const transactions = yield this.transactionRepo.findMany({
                bank_id: bankId,
            });
            let totalIncrease = 0;
            let totalReduction = 0;
            for (const tx of transactions) {
                const amount = Number(tx.amount);
                if (tx.type === app_constant_1.TransactionType.IN) {
                    totalIncrease += amount;
                }
                else if (tx.type === app_constant_1.TransactionType.OUT) {
                    totalReduction += amount;
                }
            }
            let beginning = currentBalance - (totalIncrease - totalReduction);
            let ending = 0;
            let beginningIncrease = 0;
            let reductionIncrease = 0;
            const beginningConditions = { time_at: { lte: startAt }, bank_id: bankId };
            const beginningTransactions = yield this.transactionRepo.findMany(beginningConditions);
            for (const tx of beginningTransactions) {
                const amount = Number(tx.amount);
                if (tx.type === app_constant_1.TransactionType.IN)
                    beginningIncrease += amount;
                else if (tx.type === app_constant_1.TransactionType.OUT)
                    reductionIncrease += amount;
            }
            beginning += beginningIncrease - reductionIncrease;
            // period
            let periodIncrease = 0;
            let periodReduction = 0;
            ending = beginning;
            const periodConditions = { time_at: { lte: endAt, gte: startAt }, bank_id: bankId };
            const periodTransactions = yield this.transactionRepo.findMany(Object.assign({}, periodConditions));
            let transactionDataList = [];
            for (const tx of periodTransactions) {
                const amount = Number(tx.amount);
                if (tx.type === app_constant_1.TransactionType.IN) {
                    periodIncrease += amount;
                    ending += amount;
                }
                else if (tx.type === app_constant_1.TransactionType.OUT) {
                    periodReduction += amount;
                    ending -= amount;
                }
                const transactionData = {
                    time_at: tx.time_at,
                    type: tx.type,
                    note: tx.description || '',
                    is_closed: tx.is_closed,
                    increase: tx.type === app_constant_1.TransactionType.IN ? amount : 0,
                    reduction: tx.type === app_constant_1.TransactionType.OUT ? amount : 0,
                    ending,
                };
                transactionDataList.push(transactionData);
            }
            ending = beginning + periodIncrease - periodReduction;
            return {
                beginning,
                increase: periodIncrease,
                reduction: periodReduction,
                ending,
                details: transactionDataList,
            };
        });
    }
}
exports.PaymentService = PaymentService;
