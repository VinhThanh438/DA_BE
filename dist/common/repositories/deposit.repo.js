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
exports.DepositRepo = void 0;
const base_repo_1 = require("./base.repo");
const database_adapter_1 = require("../infrastructure/database.adapter");
const prisma_select_1 = require("./prisma/prisma.select");
class DepositRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().deposits;
        this.defaultSelect = prisma_select_1.DepositSelection;
        this.detailSelect = prisma_select_1.DepositSelectionAll;
        this.modelKey = 'deposits';
        this.timeFieldDefault = 'deposit_date';
    }
    paginateDeposit(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db.findMany({
                where: {},
                select: prisma_select_1.DepositSelection,
                skip: (query.page - 1) * query.size,
                take: query.size,
                orderBy: { id: 'desc' },
            });
            return {
                data: data,
                pagination: {
                    totalPages: 1,
                    totalRecords: 1,
                    size: query.size,
                    page: query.page,
                },
            };
        });
    }
    paginate(_a, includeRelations) {
        const _super = Object.create(null, {
            paginate: { get: () => super.paginate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var { page, size, keyword, startAt, endAt, organizationId } = _a, args = __rest(_a, ["page", "size", "keyword", "startAt", "endAt", "organizationId"]);
            const _b = args, { bank } = _b, restQuery = __rest(_b, ["bank"]);
            const customWhere = Object.assign({}, (bank && {
                bank: { bank: bank },
            }));
            return _super.paginate.call(this, Object.assign({ page,
                size,
                keyword,
                startAt,
                endAt }, restQuery), includeRelations, customWhere);
        });
    }
}
exports.DepositRepo = DepositRepo;
