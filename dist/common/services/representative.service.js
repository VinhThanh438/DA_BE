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
exports.RepresentativeService = void 0;
const representative_repo_1 = require("../repositories/representative.repo");
const base_service_1 = require("./master/base.service");
const app_constant_1 = require("../../config/app.constant");
const order_repo_1 = require("../repositories/order.repo");
const transaction_repo_1 = require("../repositories/transaction.repo");
const partner_repo_1 = require("../repositories/partner.repo");
class RepresentativeService extends base_service_1.BaseService {
    constructor() {
        super(new representative_repo_1.RepresentativeRepo());
        this.orderRepo = new order_repo_1.OrderRepo();
        this.transactionRepo = new transaction_repo_1.TransactionRepo();
        this.partnerRepo = new partner_repo_1.PartnerRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RepresentativeService();
        }
        return this.instance;
    }
    paginate(_a) {
        return __awaiter(this, void 0, void 0, function* () {
            var { type } = _a, query = __rest(_a, ["type"]);
            delete query.OR;
            const data = yield this.repo.paginate(query, true);
            const result = Object.assign(Object.assign({}, data), { data: data.data.map((item) => (Object.assign(Object.assign({}, item), { orders: Array.isArray(item.orders)
                        ? item.orders.map((order) => {
                            const commission = Array.isArray(order.details)
                                ? order.details.reduce((sum, detail) => {
                                    const quantity = detail.quantity || 0;
                                    const price = detail.price || 0;
                                    const commission = detail.commission || 0;
                                    const amount = quantity * price;
                                    const commissionValue = amount * (commission / 100);
                                    return sum + commissionValue;
                                }, 0)
                                : 0;
                            return Object.assign(Object.assign({}, order), { commission });
                        })
                        : [] }))) });
            return result;
        });
    }
    getDebt(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startAt, endAt, representativeId } = query;
            yield this.validateForeignKeys(query, {
                partner_id: this.partnerRepo,
            });
            // beginning debt
            const beforeConditions = {
                AND: [{ time_at: { lte: startAt } }, { representative_id: representativeId }],
            };
            const beforeOrders = yield this.orderRepo.findMany(Object.assign({ status: app_constant_1.OrderStatus.CONFIRMED }, beforeConditions), true);
            const beforeEnriched = this.enrichTotals({ data: beforeOrders });
            const beginningDebt = beforeEnriched.data.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
            const beforeTransactions = yield this.transactionRepo.findMany(Object.assign({ order_type: app_constant_1.TransactionOrderType.COMMISSION }, beforeConditions), true);
            const reductionBefore = beforeTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
            let currentDebt = beginningDebt - reductionBefore;
            // debt during the period
            const conditions = {
                AND: [{ time_at: { lte: endAt, gte: startAt } }, { representative_id: representativeId }],
            };
            let reductData = yield this.transactionRepo.findMany(Object.assign({ order_type: app_constant_1.TransactionOrderType.ORDER }, conditions), true);
            let increaseData = yield this.orderRepo.findMany(Object.assign({ status: app_constant_1.OrderStatus.CONFIRMED }, conditions), true);
            const enrichedData = this.enrichTotals({ data: increaseData });
            let ending = currentDebt;
            let increase = 0;
            let reduction = 0;
            let stt = 1;
            const combinedDetails = [];
            for (const ele of enrichedData.data) {
                const { details, productions, contracts, invoices, inventories, employee, bank, partner, representative, organization } = ele, orderData = __rest(ele, ["details", "productions", "contracts", "invoices", "inventories", "employee", "bank", "partner", "representative", "organization"]);
                ending += ele.total_amount;
                increase += ele.total_amount;
                combinedDetails.push({
                    stt: stt++,
                    order: orderData,
                    time_at: ele.time_at,
                    increase: ele.total_amount,
                    reduction: 0,
                    ending,
                });
            }
            for (const tran of reductData) {
                const reductionAmount = Number(tran.amount) || 0;
                reduction += reductionAmount;
                ending -= reductionAmount;
                combinedDetails.push({
                    stt: stt++,
                    order: null,
                    time_at: tran.time_at,
                    increase: 0,
                    reduction: reductionAmount,
                    ending,
                });
            }
            combinedDetails.sort((a, b) => new Date(a.time_at).getTime() - new Date(b.time_at).getTime());
            return {
                beginning_debt: currentDebt,
                debt_increase: increase,
                debt_reduction: reduction,
                ending_debt: currentDebt + increase - reduction,
                details: combinedDetails,
            };
        });
    }
}
exports.RepresentativeService = RepresentativeService;
