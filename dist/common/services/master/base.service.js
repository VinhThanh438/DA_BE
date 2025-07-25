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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const api_error_1 = require("../../error/api.error");
const errors_1 = require("../../errors");
const filter_data_helper_1 = require("../../helpers/filter-data.helper");
const database_adapter_1 = require("../../infrastructure/database.adapter");
const logger_1 = __importDefault(require("../../logger"));
const app_constant_1 = require("../../../config/app.constant");
class BaseService {
    constructor(repo) {
        this.repo = repo;
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient();
    }
    validateForeignKeys(data_1, foreignKeysAndRepos_1, tx_1) {
        return __awaiter(this, arguments, void 0, function* (data, foreignKeysAndRepos, tx, isCheck = true) {
            if (!data || Object.keys(foreignKeysAndRepos).length === 0 || !isCheck)
                return;
            const invalidMessages = [];
            const dataArray = Array.isArray(data) ? data : [data];
            for (const item of dataArray) {
                for (const [foreignKey, repo] of Object.entries(foreignKeysAndRepos)) {
                    const foreignKeyValue = item[foreignKey];
                    if (foreignKeyValue != null) {
                        const existingRecord = yield repo.findOne({ id: foreignKeyValue }, false, tx);
                        if (!existingRecord) {
                            const errorKey = item.key != null ? `${foreignKey}.not_found.${item.key}` : `${foreignKey}.not_found`;
                            invalidMessages.push(errorKey);
                        }
                    }
                }
            }
            if (invalidMessages.length > 0) {
                throw new api_error_1.APIError({
                    status: errors_1.StatusCode.BAD_REQUEST,
                    message: 'common.foreign-key-constraint-violation',
                    errors: invalidMessages,
                });
            }
        });
    }
    isExist(data_1) {
        return __awaiter(this, arguments, void 0, function* (data, includeSelf = false, tx) {
            if (!data || Object.keys(data).length === 0)
                return;
            if (includeSelf && !data.id) {
                logger_1.default.warn(`${this.constructor.name}.isExist: Missing id in update method`);
                throw new api_error_1.APIError({
                    status: errors_1.StatusCode.SERVER_ERROR,
                    message: 'common.developer-error',
                });
            }
            const existMessages = [];
            for (const [field, value] of Object.entries(data)) {
                if (value != null) {
                    const filter = includeSelf ? { [field]: value, NOT: { id: data.id } } : { [field]: value };
                    const existedRecord = yield this.repo.findOne(filter, false, tx);
                    if (existedRecord) {
                        existMessages.push(`${field}.existed`);
                    }
                }
            }
            if (existMessages.length > 0) {
                throw new api_error_1.APIError({
                    status: errors_1.StatusCode.BAD_REQUEST,
                    message: 'common.existed',
                    errors: existMessages,
                });
            }
        });
    }
    isExistIncludeConditions(data_1) {
        return __awaiter(this, arguments, void 0, function* (data, includeSelf = false, tx) {
            if (!data || Object.keys(data).length === 0)
                return;
            if (includeSelf && !data.id) {
                logger_1.default.warn(`${this.constructor.name}.${errors_1.ErrorKey.EXISTED}: Missing id in update method`);
                throw new api_error_1.APIError({
                    status: errors_1.StatusCode.SERVER_ERROR,
                    message: 'common.developer-error',
                });
            }
            const orConditions = Object.entries(data)
                .filter(([key, value]) => key !== 'id' && value != null)
                .map(([key, value]) => ({ [key]: value }));
            if (orConditions.length === 0)
                return;
            const where = {
                OR: orConditions,
            };
            if (includeSelf) {
                where.NOT = { id: data.id };
            }
            const existedRecord = yield this.repo.findOne(where, false, tx);
            if (existedRecord) {
                const fields = Object.keys(data).filter((k) => k !== 'id');
                const existedFields = fields.filter((field) => existedRecord[field] === data[field]);
                const messages = existedFields.map((f) => `${f}.existed`);
                throw new api_error_1.APIError({
                    status: errors_1.StatusCode.BAD_REQUEST,
                    message: 'common.existed',
                    errors: messages,
                });
            }
        });
    }
    filterData(data, excludedFields, listFields) {
        const result = (0, filter_data_helper_1.filterDataExclude)(data, excludedFields, listFields);
        return Array.isArray(result) ? result : [result];
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existed = yield this.repo.findOne(data);
                if (existed) {
                    throw new api_error_1.APIError({
                        message: 'common.existed',
                        status: errors_1.ErrorCode.BAD_REQUEST,
                    });
                }
                const id = yield this.repo.create(data);
                return { id };
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.create: `, error);
                throw error;
            }
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.repo.findOne({ id }, true);
                if (!data) {
                    throw new api_error_1.APIError({
                        message: 'common.not-found',
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: [`id.${errors_1.ErrorKey.NOT_FOUND}`],
                    });
                }
                return data;
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.findById: `, error);
                throw error;
            }
        });
    }
    getAll(data_1) {
        return __awaiter(this, arguments, void 0, function* (data, isDefaultSelect = false) {
            try {
                const result = yield this.repo.findMany(data, isDefaultSelect);
                return result;
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.getAll: `, error);
                throw error;
            }
        });
    }
    findOne(data_1) {
        return __awaiter(this, arguments, void 0, function* (data, isDefaultSelect = false) {
            try {
                const result = yield this.repo.findOne(data, isDefaultSelect);
                if (!result) {
                    throw new api_error_1.APIError({
                        message: 'common.not_found',
                        status: errors_1.ErrorCode.BAD_REQUEST,
                    });
                }
                return result;
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.findOne: `, error);
                throw error;
            }
        });
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repo.paginate(query, true);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.paginate: `, error);
                throw error;
            }
        });
    }
    update(id, data, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existed = yield this.findById(id);
                if (!existed) {
                    throw new api_error_1.APIError({
                        message: 'common.not-found',
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: [`id.${errors_1.ErrorKey.NOT_FOUND}`],
                    });
                }
                const dataId = yield this.repo.update({ id }, data);
                return { id: dataId };
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.update: `, error);
                throw error;
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existed = yield this.findById(id);
                if (!existed) {
                    throw new api_error_1.APIError({
                        message: 'common.not-found',
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: [`id.${errors_1.ErrorKey.NOT_FOUND}`],
                    });
                }
                const dataId = yield this.repo.delete({ id });
                return { id: dataId };
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.delete: `, error);
                throw error;
            }
        });
    }
    updateChildEntity(data, repo, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data || (!data.add && !data.update && !data.delete)) {
                throw new api_error_1.APIError({
                    message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`request.${errors_1.ErrorKey.INVALID}`],
                });
            }
            const executeOperations = (transaction) => __awaiter(this, void 0, void 0, function* () {
                if (Array.isArray(data.delete) && data.delete.length > 0) {
                    for (const id of data.delete) {
                        const check = yield repo.isExist({ id }, transaction);
                        if (!check) {
                            throw new api_error_1.APIError({
                                message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                                status: errors_1.ErrorCode.BAD_REQUEST,
                                errors: [`id.${errors_1.ErrorKey.NOT_FOUND}`],
                            });
                        }
                    }
                    yield repo.deleteMany({ id: { in: data.delete } }, transaction, false);
                }
                if (Array.isArray(data.add) && data.add.length > 0) {
                    const filteredAdd = this.filterData(data.add, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['key']);
                    yield repo.createMany(filteredAdd, transaction);
                }
                if (Array.isArray(data.update) && data.update.length > 0) {
                    for (const item of data.update) {
                        const id = item.id;
                        if (!id) {
                            throw new api_error_1.APIError({
                                message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                                status: errors_1.ErrorCode.BAD_REQUEST,
                                errors: ['id.required'],
                            });
                        }
                        const exists = yield repo.findOne({ id }, true, transaction);
                        if (!exists) {
                            throw new api_error_1.APIError({
                                message: `common.status.${errors_1.StatusCode.REQUEST_NOT_FOUND}`,
                                status: errors_1.ErrorCode.REQUEST_NOT_FOUND,
                                errors: ['id.not_found'],
                            });
                        }
                        const filteredUpdate = this.filterData([item], app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['key', 'id'])[0];
                        yield repo.isExist({ id });
                        yield repo.update({ id }, filteredUpdate, transaction);
                    }
                }
                else {
                    logger_1.default.debug('No records to update');
                }
            });
            if (tx) {
                yield executeOperations(tx);
            }
            else {
                yield this.db.$transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                    yield executeOperations(transaction);
                }));
            }
        });
    }
    mapDetails(items, foreignKeys) {
        if (!items || !Array.isArray(items)) {
            return [];
        }
        return items.map((item) => (Object.assign(Object.assign({}, item), foreignKeys)));
    }
    parseJsonArray(rawFiles) {
        let files;
        if (Array.isArray(rawFiles)) {
            files = rawFiles;
        }
        else if (typeof rawFiles === 'string') {
            try {
                files = JSON.parse(rawFiles);
            }
            catch (e) {
                files = [];
            }
        }
        else if (typeof rawFiles === 'object' && rawFiles !== null) {
            files = Array.isArray(rawFiles) ? rawFiles : [rawFiles];
        }
        return files;
    }
    enrichTotals(responseData) {
        const enrichedData = responseData.data.map((order) => {
            let total_money = 0;
            let total_vat = 0;
            let total_commission = 0;
            order.details.forEach((detail) => {
                const quantity = Number(detail.quantity || 0);
                const price = Number(detail.price || 0);
                const vat = Number(detail.vat || 0);
                const commission = Number(detail.commission || 0);
                const totalMoney = quantity * price;
                const totalVat = (totalMoney * vat) / 100;
                const totalCommission = (totalMoney * commission) / 100;
                total_money += totalMoney;
                total_vat += totalVat;
                total_commission += totalCommission;
            });
            const total_amount = total_money + total_vat;
            return Object.assign(Object.assign({}, order), { total_money,
                total_vat,
                total_amount,
                total_commission });
        });
        return Object.assign(Object.assign({}, responseData), { data: enrichedData });
    }
    manualPaginate(items, page = 1, size = 20) {
        const totalRecords = items.length;
        const totalPages = Math.ceil(totalRecords / size);
        const currentPage = page;
        const offset = (currentPage - 1) * size;
        const paginatedItems = items.slice(offset, offset + size);
        return {
            data: paginatedItems,
            pagination: {
                totalPages,
                totalRecords,
                size,
                currentPage,
            },
        };
    }
    validateStatusApprove(id_1) {
        return __awaiter(this, arguments, void 0, function* (id, repo = this.repo, status = app_constant_1.CommonApproveStatus.PENDING) {
            const entity = yield repo.findOne({ id, status });
            if (!entity) {
                throw new api_error_1.APIError({
                    message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`status.${errors_1.ErrorKey.INVALID}`],
                });
            }
            return entity;
        });
    }
    canEdit(id_1, entityName_1, isAdmin_1) {
        return __awaiter(this, arguments, void 0, function* (id, entityName, isAdmin, repo = this.repo) {
            const entity = yield repo.findOne(Object.assign({ id }, (!isAdmin && { status: app_constant_1.OrderStatus.PENDING })));
            if (!entity) {
                throw new api_error_1.APIError({
                    message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`${entityName}.${errors_1.ErrorKey.CANNOT_EDIT}`],
                });
            }
            return entity;
        });
    }
    autoMapConnection(items, additionalFields, skipFields) {
        const fieldsToSkip = new Set(skipFields || ['key']);
        return items.map((item) => {
            const mapped = {};
            if (additionalFields) {
                Object.entries(additionalFields).forEach(([key, value]) => {
                    if (fieldsToSkip.has(key)) {
                        return;
                    }
                    if (key.endsWith('_id') && value != null) {
                        const relationName = key.replace('_id', '');
                        mapped[relationName] = { connect: { id: value } };
                    }
                    else {
                        mapped[key] = value;
                    }
                });
            }
            Object.entries(item).forEach(([key, value]) => {
                if (fieldsToSkip.has(key)) {
                    return;
                }
                if (key.endsWith('_id') && value != null) {
                    const relationName = key.replace('_id', '');
                    mapped[relationName] = { connect: { id: value } };
                }
                else if (!key.endsWith('_id')) {
                    mapped[key] = value;
                }
            });
            return mapped;
        });
    }
    canCheckForeignKeys(data, currentData, keys) {
        if (!data || !Array.isArray(data) || data.length === 0)
            return false;
        if (!currentData)
            return true;
        const matchingItem = data.find((item) => item.id && item.id === currentData.id);
        if (!matchingItem) {
            return true;
        }
        return keys.some((key) => matchingItem[key] && matchingItem[key] !== currentData[key]);
    }
    findAndCheckExist(item_1, fieldsToCheck_1) {
        return __awaiter(this, arguments, void 0, function* (item, fieldsToCheck, isUpdate = false, tx) {
            const whereCondition = {
                OR: fieldsToCheck
                    .map((field) => ({
                    [field]: item[field],
                }))
                    .filter((condition) => Object.values(condition)[0] != null),
            };
            if (isUpdate && item.id) {
                whereCondition.NOT = { id: item.id };
            }
            if (whereCondition.OR.length === 0)
                return null;
            const existingItem = yield this.repo.findOne(whereCondition, false, tx);
            if (existingItem) {
                // Find which field is duplicated
                const duplicatedField = fieldsToCheck.find((field) => existingItem[field] === item[field] && item[field] != null);
                throw new api_error_1.APIError({
                    message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`${duplicatedField}.${errors_1.ErrorKey.EXISTED}`],
                });
            }
            return existingItem;
        });
    }
}
exports.BaseService = BaseService;
