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
exports.EmployeeRepo = exports.getSelection = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const nested_input_helper_1 = require("../helpers/nested-input.helper");
const base_repo_1 = require("./base.repo");
const environment_1 = require("../environment");
const transform_util_1 = require("../helpers/transform.util");
const prisma_select_1 = require("./prisma/prisma.select");
const getSelection = (includeRelations) => (Object.assign(Object.assign({}, prisma_select_1.EmployeeSelection), (includeRelations ? prisma_select_1.EmployeeSelectionAll : {})));
exports.getSelection = getSelection;
class EmployeeRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().employees;
        this.defaultSelect = prisma_select_1.EmployeeSelection;
        this.detailSelect = prisma_select_1.EmployeeSelectionAll;
        this.modelKey = 'employees';
        this.SEARCHABLE_FIELDS = ['code', 'email', 'name'];
    }
    buildSearchCondition(keyword) {
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
            var { page, size, isCreateUser } = _a, args = __rest(_a, ["page", "size", "isCreateUser"]);
            if (includeRelations === void 0) { includeRelations = false; }
            const currentPage = page !== null && page !== void 0 ? page : 1;
            const limit = size !== null && size !== void 0 ? size : 10;
            const skip = (currentPage - 1) * limit;
            const { keyword, startAt, endAt, OR } = args !== null && args !== void 0 ? args : {};
            const conditions = Object.assign(Object.assign(Object.assign({}, (startAt || endAt
                ? {
                    created_at: Object.assign(Object.assign({}, (startAt && { gte: startAt })), (endAt && { lte: endAt })),
                }
                : {})), (isCreateUser ? { has_user_account: false } : {})), { NOT: {
                    name: environment_1.ADMIN_USER_NAME,
                }, OR });
            if (keyword) {
                const searchCondition = this.buildSearchCondition(keyword);
                if (searchCondition) {
                    conditions.OR = searchCondition.OR;
                }
            }
            const [data, totalRecords] = yield Promise.all([
                this.db.findMany({
                    where: conditions,
                    select: (0, exports.getSelection)(includeRelations),
                    skip,
                    take: limit,
                    orderBy: { id: 'desc' },
                }),
                this.db.count({ where: conditions }),
            ]);
            const totalPages = Math.ceil(totalRecords / limit);
            data.forEach((item) => {
                if (item.employee_finances) {
                    item.employee_finances = (0, transform_util_1.transformDecimal)(item.employee_finances);
                }
            });
            return {
                data: (0, transform_util_1.transformDecimal)(data),
                pagination: {
                    totalPages: totalPages,
                    totalRecords: totalRecords,
                    size: limit,
                    currentPage: currentPage,
                },
            };
        });
    }
    getAll() {
        return __awaiter(this, arguments, void 0, function* (where = {}, includeRelations = false) {
            return this.db.findMany({
                where: Object.assign(Object.assign({}, where), { is_deleted: false }),
                select: (0, exports.getSelection)(includeRelations),
            });
        });
    }
    findOne() {
        return __awaiter(this, arguments, void 0, function* (where = {}, includeRelations = false) {
            const data = yield this.db.findFirst({
                where: Object.assign(Object.assign({}, where), { is_deleted: false }),
                select: (0, exports.getSelection)(includeRelations),
            });
            return (0, transform_util_1.transformDecimal)(data);
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
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { job_position_id, educations, employee_finances, addresses, emergency_contacts, employee_contracts, insurances } = data, rest = __rest(data, ["job_position_id", "educations", "employee_finances", "addresses", "emergency_contacts", "employee_contracts", "insurances"]);
            if (rest.organization_id) {
                rest.organization = { connect: { id: rest.organization_id } };
                delete rest.organization_id;
            }
            const result = yield this.db.create({
                data: Object.assign(Object.assign(Object.assign({}, rest), (job_position_id && {
                    job_position: {
                        connect: { id: job_position_id },
                    },
                })), { educations: (0, nested_input_helper_1.mapNestedInput)(educations), employee_finances: (0, nested_input_helper_1.mapNestedInput)(employee_finances), addresses: (0, nested_input_helper_1.mapNestedInput)(addresses), emergency_contacts: (0, nested_input_helper_1.mapNestedInput)(emergency_contacts), employee_contracts: (0, nested_input_helper_1.mapNestedInput)(employee_contracts), insurances: (0, nested_input_helper_1.mapNestedInput)(insurances) }),
                include: {
                    educations: true,
                    addresses: true,
                    emergency_contacts: true,
                    insurances: true,
                    employee_finances: true,
                    employee_contracts: true,
                },
            });
            return result.id;
        });
    }
    delete(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db.deleteMany({
                where,
            });
            return result.count;
        });
    }
    update(where, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { educations, employee_finances, addresses, emergency_contacts, insurances, employee_contracts, job_position_id } = data, employeeData = __rest(data, ["educations", "employee_finances", "addresses", "emergency_contacts", "insurances", "employee_contracts", "job_position_id"]);
            const result = yield this.db.update({
                where: {
                    id: where.id,
                    is_deleted: false,
                },
                data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, employeeData), (educations && {
                    educations: {
                        deleteMany: {},
                        create: educations,
                    },
                })), (employee_finances && {
                    employee_finances: {
                        deleteMany: {},
                        create: employee_finances,
                    },
                })), (addresses && {
                    addresses: {
                        deleteMany: {},
                        create: addresses,
                    },
                })), (emergency_contacts && {
                    emergency_contacts: {
                        deleteMany: {},
                        create: emergency_contacts,
                    },
                })), (insurances && {
                    insurances: {
                        deleteMany: {},
                        create: insurances,
                    },
                })), (employee_contracts && {
                    employee_contracts: {
                        deleteMany: {},
                        create: employee_contracts,
                    },
                })), (job_position_id && {
                    job_position: {
                        connect: { id: job_position_id },
                    },
                })),
            });
            return result.id;
        });
    }
}
exports.EmployeeRepo = EmployeeRepo;
