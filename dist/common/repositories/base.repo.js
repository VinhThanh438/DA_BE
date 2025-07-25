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
exports.BaseRepo = void 0;
const searchBuilder_1 = __importDefault(require("../helpers/searchBuilder"));
const time_adapter_1 = require("../infrastructure/time.adapter");
const transform_util_1 = require("../helpers/transform.util");
const database_adapter_1 = require("../infrastructure/database.adapter");
const client_1 = require("@prisma/client");
/**
 * Note:
 * @param T: Represents the Prisma model type (e.g., Something)
 * @param S: Represents the Prisma select type (e.g., Prisma.SomethingSelect)
 * @param W: Represents the Prisma WhereInput type (e.g., Prisma.SomethingWhereInput)
 */
class BaseRepo {
    constructor() {
        this.searchableFields = {
            basic: [],
        };
        this.timeFieldDefault = 'created_at';
        this.dbAdapter = database_adapter_1.DatabaseAdapter.getInstance().getClient();
    }
    getModel(tx) {
        return tx ? tx[this.modelKey] : this.db;
    }
    paginate(_a, includeRelations, query, customSelect, orderBy) {
        return __awaiter(this, void 0, void 0, function* () {
            var { page = 1, size = 10, keyword, startAt, endAt } = _a, args = __rest(_a, ["page", "size", "keyword", "startAt", "endAt"]);
            if (includeRelations === void 0) { includeRelations = false; }
            if (query === void 0) { query = {}; }
            if (customSelect === void 0) { customSelect = null; }
            if (orderBy === void 0) { orderBy = { id: 'desc' }; }
            const searchConditions = searchBuilder_1.default.buildSearch(keyword, this.searchableFields.basic);
            const where = Object.assign(Object.assign(Object.assign({}, query), args), searchConditions);
            if (startAt || endAt) {
                where[this.timeFieldDefault] = {};
                if (startAt)
                    where[this.timeFieldDefault].gte = time_adapter_1.TimeAdapter.parseStartOfDayDate(startAt);
                if (endAt)
                    where[this.timeFieldDefault].lte = time_adapter_1.TimeAdapter.parseEndOfDayDate(endAt);
            }
            // Build select condition
            let buildSelect;
            if (includeRelations) {
                if (customSelect) {
                    buildSelect = Object.assign(Object.assign({}, this.detailSelect), customSelect);
                }
                else {
                    buildSelect = this.detailSelect;
                }
            }
            else {
                buildSelect = this.defaultSelect;
            }
            //
            const totalRecords = yield this.db.count({ where: Object.assign(Object.assign({}, where), (args && args)) });
            if (page === 0 && size === 0) {
                return {
                    data: [],
                    pagination: {
                        totalPages: 1,
                        totalRecords: totalRecords,
                        size,
                        currentPage: 1,
                    },
                };
            }
            const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / size) : 1;
            const currentPage = Math.min(page, totalPages);
            const skip = (currentPage - 1) * size;
            const data = yield this.db.findMany({
                where: Object.assign(Object.assign({}, where), (args && args)),
                select: buildSelect,
                skip,
                take: size,
                orderBy,
            });
            return {
                data: (0, transform_util_1.transformDecimal)(data),
                pagination: {
                    totalPages,
                    totalRecords,
                    size,
                    currentPage,
                },
            };
        });
    }
    findOne() {
        return __awaiter(this, arguments, void 0, function* (where = {}, includeRelations = false, tx) {
            const sanitizedWhere = this.sanitizeJsonFilters(where);
            const db = this.getModel(tx);
            const data = yield db.findFirst({
                where: sanitizedWhere,
                select: includeRelations ? this.detailSelect : this.defaultSelect,
            });
            return (0, transform_util_1.transformDecimal)(data);
        });
    }
    getLastRecord(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.getModel(tx);
            return db.findFirst({
                orderBy: {
                    id: 'desc',
                },
                select: {
                    id: true,
                    code: true,
                },
            });
        });
    }
    sanitizeInOperators(obj) {
        if (typeof obj !== 'object' || obj === null)
            return obj;
        const newObj = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
            if (key === 'in' && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                newObj[key] = Object.values(obj[key]);
            }
            else {
                newObj[key] = this.sanitizeInOperators(obj[key]);
            }
        }
        return newObj;
    }
    findMany() {
        return __awaiter(this, arguments, void 0, function* (where = {}, includeRelations = false, tx, include = {}) {
            let sanitizedWhere = this.sanitizeJsonFilters(where);
            for (const logicKey of ['AND', 'OR', 'NOT']) {
                if (sanitizedWhere[logicKey] &&
                    !Array.isArray(sanitizedWhere[logicKey]) &&
                    typeof sanitizedWhere[logicKey] === 'object') {
                    sanitizedWhere[logicKey] = Object.values(sanitizedWhere[logicKey]);
                }
            }
            sanitizedWhere = this.sanitizeInOperators(sanitizedWhere);
            const db = this.getModel(tx);
            const query = {
                where: sanitizedWhere,
                orderBy: { [this.timeFieldDefault]: 'desc' },
            };
            if (includeRelations) {
                if (include && Object.keys(include).length > 0) {
                    query.include = include;
                }
                else {
                    query.select = this.detailSelect;
                }
            }
            else {
                query.select = this.defaultSelect;
            }
            const data = yield db.findMany(query);
            return (0, transform_util_1.transformDecimal)(data);
        });
    }
    isExist() {
        return __awaiter(this, arguments, void 0, function* (where = {}, tx) {
            const sanitizedWhere = this.sanitizeJsonFilters(where);
            const db = this.getModel(tx);
            return db.findFirst({
                where: sanitizedWhere,
                select: this.defaultSelect,
            });
        });
    }
    findFirst() {
        return __awaiter(this, arguments, void 0, function* (where = {}, includeRelations = false, tx) {
            const sanitizedWhere = this.sanitizeJsonFilters(where);
            const db = this.getModel(tx);
            return db.findFirst({
                where: sanitizedWhere,
                select: includeRelations ? this.detailSelect : this.defaultSelect,
            });
        });
    }
    create(body, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.getModel(tx);
            const organizationId = body.organization_id;
            try {
                if (organizationId) {
                    body.organization = { connect: { id: organizationId } };
                    delete body.organization_id;
                }
                const data = yield db.create({ data: body });
                return data === null || data === void 0 ? void 0 : data.id;
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientValidationError) {
                    if (organizationId) {
                        delete body.organization;
                        body.organization_id = organizationId;
                    }
                    const data = yield db.create({ data: body });
                    return data === null || data === void 0 ? void 0 : data.id;
                }
                throw error;
            }
        });
    }
    createMany(bodies, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            let count = 0;
            let listDataItems = [];
            const db = this.getModel(tx);
            const run = () => __awaiter(this, void 0, void 0, function* () {
                for (const item of bodies) {
                    const data = yield db.create({ data: item });
                    listDataItems.push(data);
                    count++;
                }
            });
            if (tx) {
                yield run();
            }
            else {
                yield this.dbAdapter.$transaction(run);
            }
            return listDataItems;
        });
    }
    updateManyByCondition() {
        return __awaiter(this, arguments, void 0, function* (where = {}, body, tx, needSanitized = true) {
            const db = this.getModel(tx);
            const sanitizedWhere = this.sanitizeJsonFilters(where);
            yield db.updateMany({
                where: needSanitized ? sanitizedWhere : where,
                data: body,
            });
        });
    }
    updateMany(bodies, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            let count = 0;
            const db = this.getModel(tx);
            const run = () => __awaiter(this, void 0, void 0, function* () {
                for (const item of bodies) {
                    yield db.update({
                        where: { id: item.id },
                        data: item,
                    });
                }
            });
            if (tx) {
                yield run();
            }
            else {
                yield this.dbAdapter.$transaction(run);
            }
            return count || 0;
        });
    }
    update() {
        return __awaiter(this, arguments, void 0, function* (where = {}, body, tx) {
            const db = this.getModel(tx);
            const data = yield db.update({
                where: {
                    id: where.id,
                },
                data: body,
            });
            return data === null || data === void 0 ? void 0 : data.id;
        });
    }
    delete() {
        return __awaiter(this, arguments, void 0, function* (where = {}, tx) {
            const db = this.getModel(tx);
            const data = yield db.delete({
                where: {
                    id: where.id,
                },
            });
            return data === null || data === void 0 ? void 0 : data.id;
        });
    }
    deleteMany() {
        return __awaiter(this, arguments, void 0, function* (where = {}, tx, needSanitized = true) {
            const sanitizedWhere = this.sanitizeJsonFilters(where);
            const db = this.getModel(tx);
            const data = yield db.deleteMany({
                where: needSanitized ? sanitizedWhere : where,
            });
            return data === null || data === void 0 ? void 0 : data.id;
        });
    }
    upsertChildren(items, childRepo, parentField, parentId, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!items)
                return;
            for (const item of items) {
                const { id } = item, rest = __rest(item, ["id"]);
                const whereClause = Object.assign(Object.assign({}, (id && { id })), { [parentField]: parentId });
                const existing = id ? yield childRepo.findOne(whereClause, false, tx) : null;
                if (existing) {
                    yield childRepo.update({ id }, item, tx);
                }
                else {
                    yield childRepo.create(Object.assign(Object.assign({}, item), { [parentField]: parentId }), tx);
                }
            }
        });
    }
    /**
     * Sanitize fields that are of type JsonNullable or JsonNullableFilter
     * by removing empty arrays or invalid values to prevent Prisma errors.
     */
    sanitizeJsonFilters(input) {
        if (!input || typeof input !== 'object')
            return input;
        const sanitized = {};
        for (const key of Object.keys(input)) {
            const value = input[key];
            if (Array.isArray(value) && value.length === 0) {
                continue;
            }
            else if (value && typeof value === 'object') {
                sanitized[key] = this.sanitizeJsonFilters(value);
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    aggregate(where, aggregateParams, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.getModel(tx);
            try {
                const result = yield model.aggregate(Object.assign({ where }, aggregateParams));
                return (0, transform_util_1.transformDecimal)(result);
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.BaseRepo = BaseRepo;
