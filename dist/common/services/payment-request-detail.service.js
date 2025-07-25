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
exports.PaymentRequestDetailService = void 0;
const base_service_1 = require("./master/base.service");
const payment_request_details_repo_1 = require("../repositories/payment-request-details.repo");
class PaymentRequestDetailService extends base_service_1.BaseService {
    constructor() {
        super(new payment_request_details_repo_1.PaymentRequestDetailRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PaymentRequestDetailService();
        }
        return this.instance;
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (query.OR) {
                delete query.OR;
            }
            let totalAmount = 0;
            const { status, paymentMethod } = query, rest = __rest(query, ["status", "paymentMethod"]);
            const aggregateConditions = status ? { status } : {};
            if (paymentMethod) {
                const orderConditions = {
                    payment_method: paymentMethod,
                };
                aggregateConditions.order = orderConditions;
                query.order = orderConditions;
                delete query.paymentMethod;
            }
            const aggregateResult = yield this.repo.aggregate(aggregateConditions, {
                _sum: { amount: true },
            });
            totalAmount = Number(((_a = aggregateResult._sum) === null || _a === void 0 ? void 0 : _a.amount) || 0);
            const result = yield this.repo.paginate(aggregateConditions, true);
            if (!result.summary)
                result.summary = {};
            result.summary.total_amount = totalAmount;
            return result;
        });
    }
}
exports.PaymentRequestDetailService = PaymentRequestDetailService;
