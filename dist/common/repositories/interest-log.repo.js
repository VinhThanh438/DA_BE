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
exports.InterestLogRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class InterestLogRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().interestLogs;
        this.defaultSelect = prisma_select_1.InterestLogSelection;
        this.detailSelect = prisma_select_1.InterestLogSelectionAll;
        this.modelKey = 'interestLogs';
        this.timeFieldDefault = 'time_at';
        this.searchableFields = {
            basic: [{ path: ['code'] }],
        };
    }
    findFirst() {
        return __awaiter(this, arguments, void 0, function* (where = {}, includeRelations = false, tx) {
            const sanitizedWhere = this.sanitizeJsonFilters(where);
            const db = this.getModel(tx);
            return db.findFirst({
                where: sanitizedWhere,
                select: includeRelations ? this.detailSelect : this.defaultSelect,
                orderBy: {
                    created_at: 'desc',
                },
            });
        });
    }
    paginate(_a, includeRelations) {
        const _super = Object.create(null, {
            paginate: { get: () => super.paginate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var { page, size, keyword, startAt, endAt } = _a, args = __rest(_a, ["page", "size", "keyword", "startAt", "endAt"]);
            const _b = args, { bank_id, is_paymented } = _b, restQuery = __rest(_b, ["bank_id", "is_paymented"]);
            const customWhere = Object.assign(Object.assign({}, (is_paymented && {
                is_paymented: is_paymented,
            })), (bank_id && {
                loan: {
                    bank_id: bank_id,
                },
            }));
            const customSelect = {
                loan: {
                    select: prisma_select_1.LoanSelection,
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
exports.InterestLogRepo = InterestLogRepo;
