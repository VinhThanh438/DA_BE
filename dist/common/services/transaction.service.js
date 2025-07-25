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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const base_service_1 = require("./master/base.service");
const transaction_repo_1 = require("../repositories/transaction.repo");
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const payment_request_repo_1 = require("../repositories/payment-request.repo");
const payment_request_details_repo_1 = require("../repositories/payment-request-details.repo");
const bank_repo_1 = require("../repositories/bank.repo");
const time_adapter_1 = require("../infrastructure/time.adapter");
const prisma_select_1 = require("../repositories/prisma/prisma.select");
class TransactionService extends base_service_1.BaseService {
    constructor() {
        super(new transaction_repo_1.TransactionRepo());
        this.paymentRequestRepo = new payment_request_repo_1.PaymentRequestRepo();
        this.paymentRequestDetailRepo = new payment_request_details_repo_1.PaymentRequestDetailRepo();
        this.bankRepo = new bank_repo_1.BankRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new TransactionService();
        }
        return this.instance;
    }
    paginate(query) {
        const { bankId } = query, rest = __rest(query, ["bankId"]);
        const where = Object.assign(Object.assign({}, rest), (bankId && { bank_id: Number(bankId) }));
        return this.repo.paginate(where);
    }
    getAllTransactions(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: bankId, orderIds = [], startAt, endAt } = filter;
            const bankExist = yield this.bankRepo.findOne({ id: parseInt((bankId === null || bankId === void 0 ? void 0 : bankId.toString()) || '0') });
            if (!bankExist) {
                throw new api_error_1.APIError({
                    message: `common.bank_id.${errors_1.StatusCode.BAD_REQUEST}`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`bank_id.${errors_1.ErrorKey.NOT_FOUND}`],
                });
            }
            const where = Object.assign(Object.assign(Object.assign({}, (bankId && { bank_id: parseInt(bankId.toString()) })), (orderIds.length > 0 && { order_id: { in: orderIds.map((i) => parseInt(i)) } })), ((startAt || endAt) && {
                time_at: Object.assign(Object.assign({}, (startAt && { gte: time_adapter_1.TimeAdapter.parseStartOfDayDate(startAt) })), (endAt && { lte: time_adapter_1.TimeAdapter.parseEndOfDayDate(endAt) })),
            }));
            const transactions = yield this.db.transactions.findMany({
                where,
                select: prisma_select_1.TransactionSelectWithBankOrder,
            });
            return { transactions, beginning: yield this.calBeginning(startAt, Number(bankExist.beginning_balance)) };
        });
    }
    calBeginning(startAt, beginningBalance) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (!startAt)
                return 0;
            // số dư đầu kỳ = số dư ban đầu + tăng - giảm
            const calIncrease = yield this.db.transactions.aggregate({
                where: {
                    time_at: { lte: new Date(startAt).toISOString() },
                    type: 'in',
                },
                _sum: { amount: true },
            });
            const calDecrease = yield this.db.transactions.aggregate({
                where: {
                    time_at: { lte: new Date(startAt).toISOString() },
                    type: 'out',
                },
                _sum: { amount: true },
            });
            const calBeginning = parseInt(beginningBalance === null || beginningBalance === void 0 ? void 0 : beginningBalance.toString()) +
                parseInt(((_b = (_a = calIncrease._sum) === null || _a === void 0 ? void 0 : _a.amount) === null || _b === void 0 ? void 0 : _b.toString()) || '0') -
                parseInt(((_d = (_c = calDecrease._sum) === null || _c === void 0 ? void 0 : _c.amount) === null || _d === void 0 ? void 0 : _d.toString()) || '0');
            return calBeginning;
        });
    }
    createTransactionByPaymentRequestDetail(paymentRequestDetailId, otherData) {
        return __awaiter(this, void 0, void 0, function* () {
            const paymentRequestDetail = yield this.paymentRequestDetailRepo.findOne({
                id: paymentRequestDetailId,
            });
            if (paymentRequestDetail) {
                const { order_id, invoice_id, payment_request_id } = paymentRequestDetail, paymentRequestDetailData = __rest(paymentRequestDetail, ["order_id", "invoice_id", "payment_request_id"]);
                const paymentRequest = yield this.paymentRequestRepo.findOne({
                    id: payment_request_id,
                });
                const createdId = yield this.repo.create(Object.assign(Object.assign({}, otherData), { order_type: paymentRequest === null || paymentRequest === void 0 ? void 0 : paymentRequest.type, order: order_id ? { connect: { id: order_id } } : undefined, invoice: invoice_id ? { connect: { id: invoice_id } } : undefined }));
                const transaction = yield this.repo.findOne({ id: createdId }, true);
                return transaction;
            }
            return null;
        });
    }
    getAll(data_1) {
        return __awaiter(this, arguments, void 0, function* (data, isDefaultSelect = false) {
            return this.repo.findMany(data, isDefaultSelect);
        });
    }
}
exports.TransactionService = TransactionService;
