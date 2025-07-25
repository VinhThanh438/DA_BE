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
exports.ShippingPlanService = void 0;
const base_service_1 = require("./base.service");
const order_repo_1 = require("../../repositories/order.repo");
const partner_repo_1 = require("../../repositories/partner.repo");
const shipping_plan_repo_1 = require("../../repositories/shipping-plan.repo");
const app_constant_1 = require("../../../config/app.constant");
class ShippingPlanService extends base_service_1.BaseService {
    constructor() {
        super(new shipping_plan_repo_1.ShippingPlanRepo());
        this.partnerRepo = new partner_repo_1.PartnerRepo();
        this.orderRepo = new order_repo_1.OrderRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ShippingPlanService();
        }
        return this.instance;
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isDone } = query, otherQuery = __rest(query, ["isDone"]);
            const where = Object.assign({}, otherQuery);
            if (isDone) {
                where.is_done = isDone;
                where.status = app_constant_1.ShippingPlanStatus.CONFIRMED;
                where.vat = { not: 0 };
            }
            const data = yield this.repo.paginate(where, true);
            return data;
        });
    }
    createShippingPlan(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateForeignKeys(request, {
                partner_id: this.partnerRepo,
                order_id: this.orderRepo,
            });
            const createdId = yield this.repo.create(request);
            return { id: createdId };
        });
    }
    updateShippingPlan(id, request, isAdmin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.canEdit(id, 'shipping-plan', isAdmin);
            yield this.validateForeignKeys(request, {
                partner_id: this.partnerRepo,
                order_id: this.orderRepo,
            });
            yield this.repo.update({ id }, request);
            return { id };
        });
    }
    deleteShippingPlan(id, isAdmin) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.canEdit(id, 'shipping-plan', isAdmin);
            yield this.repo.delete({ id });
            return { id };
        });
    }
}
exports.ShippingPlanService = ShippingPlanService;
