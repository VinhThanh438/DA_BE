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
exports.UserRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const environment_1 = require("../environment");
const prisma_select_1 = require("./prisma/prisma.select");
class UserRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().users;
        this.defaultSelect = prisma_select_1.UserSelectionWithoutPassword;
        this.detailSelect = prisma_select_1.UserSelectionAll;
        this.modelKey = 'users';
    }
    static buildSearchCondition(keyword) {
        if (!keyword)
            return undefined;
        return {
            OR: this.SEARCHABLE_FIELDS.map((field) => ({
                [field]: { contains: keyword, mode: 'insensitive' },
            })),
        };
    }
    paginate(_a, includeRelations) {
        return __awaiter(this, void 0, void 0, function* () {
            var { page, size } = _a, args = __rest(_a, ["page", "size"]);
            if (includeRelations === void 0) { includeRelations = false; }
            const currentPage = page !== null && page !== void 0 ? page : 1;
            const limit = size !== null && size !== void 0 ? size : 10;
            const skip = (currentPage - 1) * limit;
            const { keyword, startAt, endAt, OR } = args !== null && args !== void 0 ? args : {};
            const conditions = Object.assign(Object.assign({ is_deleted: false }, (startAt || endAt
                ? {
                    created_at: Object.assign(Object.assign({}, (startAt && { gte: startAt })), (endAt && { lte: endAt })),
                }
                : {})), { NOT: {
                    username: environment_1.ADMIN_USER_NAME,
                }, OR });
            if (keyword) {
                const searchCondition = UserRepo.buildSearchCondition(keyword);
                if (searchCondition) {
                    conditions.OR = searchCondition.OR;
                }
            }
            const [data, totalRecords] = yield Promise.all([
                this.db.findMany({
                    where: conditions,
                    select: includeRelations ? this.detailSelect : this.defaultSelect,
                    skip,
                    take: size,
                    orderBy: { id: 'desc' },
                }),
                this.db.count({ where: conditions }),
            ]);
            const totalPages = Math.ceil(totalRecords / limit);
            return {
                data: data,
                pagination: {
                    totalPages: totalPages,
                    totalRecords: totalRecords,
                    size: limit,
                    currentPage: currentPage,
                },
            };
        });
    }
    isExist() {
        return __awaiter(this, arguments, void 0, function* (where = {}) {
            return this.db.findFirst({
                where: Object.assign(Object.assign({}, where), { is_deleted: false }),
                select: {
                    id: true,
                },
            });
        });
    }
    getDetailInfo() {
        return __awaiter(this, arguments, void 0, function* (where = {}) {
            return this.db.findFirst({
                where: Object.assign(Object.assign({}, where), { is_deleted: false }),
                select: prisma_select_1.UserSelection,
            });
        });
    }
}
exports.UserRepo = UserRepo;
UserRepo.SEARCHABLE_FIELDS = ['code', 'username', 'email'];
