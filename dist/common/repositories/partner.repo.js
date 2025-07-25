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
exports.PartnerRepo = void 0;
const prisma_select_1 = require("./prisma/prisma.select");
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
class PartnerRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().partners;
        this.defaultSelect = prisma_select_1.PartnerSelection;
        this.detailSelect = prisma_select_1.PartnerSelectionAll;
        this.modelKey = 'partners';
        this.searchableFields = {
            basic: [{ path: ['name'] }, { path: ['code'] }, { path: ['email'] }, { path: ['tax'] }],
        };
    }
    paginate(_a, includeRelations) {
        const _super = Object.create(null, {
            paginate: { get: () => super.paginate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var { page, size, keyword, startAt, endAt } = _a, args = __rest(_a, ["page", "size", "keyword", "startAt", "endAt"]);
            const _b = args, { types } = _b, restQuery = __rest(_b, ["types"]);
            const customWhere = Object.assign({}, ((types === null || types === void 0 ? void 0 : types.length) && {
                type: { in: types },
            }));
            return _super.paginate.call(this, Object.assign({ page,
                size,
                keyword,
                startAt,
                endAt }, restQuery), includeRelations, customWhere);
        });
    }
}
exports.PartnerRepo = PartnerRepo;
