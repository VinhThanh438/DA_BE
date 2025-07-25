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
exports.PaymentRequestService = void 0;
const base_service_1 = require("./master/base.service");
const employee_repo_1 = require("../repositories/employee.repo");
const payment_request_repo_1 = require("../repositories/payment-request.repo");
const app_constant_1 = require("../../config/app.constant");
const payment_request_details_repo_1 = require("../repositories/payment-request-details.repo");
const order_repo_1 = require("../repositories/order.repo");
const invoice_repo_1 = require("../repositories/invoice.repo");
const partner_repo_1 = require("../repositories/partner.repo");
const generate_unique_code_helper_1 = require("../helpers/generate-unique-code.helper");
const loan_repo_1 = require("../repositories/loan.repo");
const interest_log_repo_1 = require("../repositories/interest-log.repo");
const searchBuilder_1 = __importDefault(require("../helpers/searchBuilder"));
const bank_repo_1 = require("../repositories/bank.repo");
class PaymentRequestService extends base_service_1.BaseService {
    constructor() {
        super(new payment_request_repo_1.PaymentRequestRepo());
        this.paymentRequestDetails = new payment_request_details_repo_1.PaymentRequestDetailRepo();
        this.employeeRepo = new employee_repo_1.EmployeeRepo();
        this.orderRepo = new order_repo_1.OrderRepo();
        this.invoiceRepo = new invoice_repo_1.InvoiceRepo();
        this.partnerRepo = new partner_repo_1.PartnerRepo();
        this.loanRepo = new loan_repo_1.LoanRepo();
        this.bankRepo = new bank_repo_1.BankRepo();
        this.interestLogRepo = new interest_log_repo_1.InterestLogRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PaymentRequestService();
        }
        return this.instance;
    }
    createPaymentRequest(request, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            let paymentRequestId = 0;
            yield this.validateForeignKeys(request, {
                employee_id: this.employeeRepo,
                approver_id: this.employeeRepo,
                partner_id: this.partnerRepo,
                bank_id: this.bankRepo,
            }, tx);
            const runTransaction = (transaction) => __awaiter(this, void 0, void 0, function* () {
                const _a = request, { details, partner_id, employee_id, approver_id, organization_id, bank_id, representative_id } = _a, paymentRequestData = __rest(_a, ["details", "partner_id", "employee_id", "approver_id", "organization_id", "bank_id", "representative_id"]);
                paymentRequestData.partner = partner_id ? { connect: { id: partner_id } } : undefined;
                paymentRequestData.employee = employee_id ? { connect: { id: employee_id } } : undefined;
                paymentRequestData.approver = approver_id ? { connect: { id: approver_id } } : undefined;
                paymentRequestData.organization = organization_id ? { connect: { id: organization_id } } : undefined;
                paymentRequestData.bank = bank_id ? { connect: { id: bank_id } } : undefined;
                paymentRequestData.representative = representative_id ? { connect: { id: representative_id } } : undefined;
                paymentRequestId = yield this.repo.create(paymentRequestData, transaction);
                if (details && details.length > 0) {
                    yield this.validateForeignKeys(details, {
                        order_id: this.orderRepo,
                        invoice_id: this.invoiceRepo,
                        loan_id: this.loanRepo,
                        interest_log_id: this.interestLogRepo,
                    }, transaction);
                    const mappedDetails = details.map((item) => {
                        const { order_id, invoice_id, loan_id, interest_log_id } = item, rest = __rest(item, ["order_id", "invoice_id", "loan_id", "interest_log_id"]);
                        return Object.assign(Object.assign({}, rest), { code: (0, generate_unique_code_helper_1.generateUniqueCode)({ lastCode: null, prefix: paymentRequestData.code, maxLength: 2 }), order: order_id ? { connect: { id: order_id } } : undefined, invoice: invoice_id ? { connect: { id: invoice_id } } : undefined, payment_request: paymentRequestId ? { connect: { id: paymentRequestId } } : undefined, loan: loan_id ? { connect: { id: loan_id } } : undefined, interest_log: interest_log_id ? { connect: { id: interest_log_id } } : undefined });
                    });
                    const filteredData = this.filterData(mappedDetails, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['details']);
                    yield this.paymentRequestDetails.createMany(filteredData, transaction);
                }
            });
            if (tx) {
                yield runTransaction(tx);
            }
            else {
                yield this.db.$transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                    yield runTransaction(transaction);
                }));
            }
            return { id: paymentRequestId };
        });
    }
    updatePaymentRequest(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.isExist({ code: request.code, id }, true);
            yield this.validateForeignKeys(request, {
                employee_id: this.employeeRepo,
                approver_id: this.employeeRepo,
            });
            const updatedId = yield this.repo.update({ id }, request);
            return { id: updatedId };
        });
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, size, keyword, startAt, endAt, types } = query, o = __rest(query, ["page", "size", "keyword", "startAt", "endAt", "types"]);
            let condition = Object.assign({}, o);
            if (query.partnerId) {
                query.partner_id = query.partnerId;
                condition = Object.assign(Object.assign({}, condition), { partner_id: query.partnerId });
                delete query.partnerId;
            }
            if (query.types) {
                query.type = { in: query.types };
                condition = Object.assign(Object.assign({}, condition), { type: { in: query.types } });
                delete query.types;
            }
            const result = yield this.repo.paginate(query, true);
            const searchConditions = searchBuilder_1.default.buildSearch(query.keyword, [
                { path: ['code'] },
                { path: ['partner', 'name'] },
                { path: ['details', 'invoice', 'code'], isArray: true },
            ]);
            const whereSumCondition = {
                payment_request: Object.assign(Object.assign({ time_at: Object.assign(Object.assign({}, (startAt && { gte: startAt })), (endAt && { lte: endAt })) }, condition), searchConditions),
            };
            const sumAmountData = yield this.db.paymentRequestDetails.aggregate({
                where: whereSumCondition,
                _sum: {
                    amount: true,
                },
            });
            if (!result.summary)
                result.summary = {};
            result.summary.total_amount = sumAmountData._sum.amount || 0;
            return result;
        });
    }
    approve(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateStatusApprove(id);
            const updatedId = yield this.repo.update({ id }, { status: body.status });
            yield this.paymentRequestDetails.updateManyByCondition({ payment_request_id: updatedId }, {
                status: app_constant_1.PaymentRequestDetailStatus.PENDING,
            });
            return { id };
        });
    }
}
exports.PaymentRequestService = PaymentRequestService;
