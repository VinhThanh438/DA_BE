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
exports.PurchaseRequestRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class PurchaseRequestRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().purchaseRequests;
        this.defaultSelect = prisma_select_1.PurchaseRequestSelection;
        this.detailSelect = prisma_select_1.PurchaseRequestSelectionAll;
        this.timeFieldDefault = 'time_at';
        this.modelKey = 'purchaseRequests';
    }
    paginate(_a, includeRelations) {
        const _super = Object.create(null, {
            paginate: { get: () => super.paginate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var { page, size, keyword, startAt, endAt } = _a, args = __rest(_a, ["page", "size", "keyword", "startAt", "endAt"]);
            const _b = args, { productIds, employeeIds } = _b, restQuery = __rest(_b, ["productIds", "employeeIds"]);
            const customWhere = Object.assign(Object.assign({}, ((productIds === null || productIds === void 0 ? void 0 : productIds.length) && {
                details: { some: { material_id: { in: productIds } } },
            })), ((employeeIds === null || employeeIds === void 0 ? void 0 : employeeIds.length) && {
                employee_id: { in: employeeIds },
            }));
            const customSelect = {
                details: {
                    where: Object.assign({}, ((productIds === null || productIds === void 0 ? void 0 : productIds.length) && { material_id: { in: productIds } })),
                    select: prisma_select_1.PurchaseRequestDetailSelectionAll,
                },
            };
            return _super.paginate.call(this, Object.assign({ page,
                size,
                keyword,
                startAt,
                endAt }, restQuery), includeRelations, customWhere, customSelect);
        });
    }
}
exports.PurchaseRequestRepo = PurchaseRequestRepo;
