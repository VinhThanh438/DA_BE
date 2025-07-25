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
exports.ProductService = void 0;
const event_constant_1 = require("../../config/event.constant");
const product_repo_1 = require("../repositories/product.repo");
const unit_repo_1 = require("../repositories/unit.repo");
const errors_1 = require("../errors");
const api_error_1 = require("../error/api.error");
const base_service_1 = require("./master/base.service");
const eventbus_1 = __importDefault(require("../eventbus"));
const stock_tracking_repo_1 = require("../repositories/stock-tracking.repo");
const inventory_detail_repo_1 = require("../repositories/inventory-detail.repo");
const inventory_repo_1 = require("../repositories/inventory.repo");
const transaction_warehouse_repo_1 = require("../repositories/transaction-warehouse.repo");
class ProductService extends base_service_1.BaseService {
    // private productDetailService: ProductDetailService = ProductDetailService.getInstance();
    constructor() {
        super(new product_repo_1.ProductRepo());
        this.unitRepo = new unit_repo_1.UnitRepo();
        this.stockTrackingRepo = new stock_tracking_repo_1.StockTrackingRepo();
        this.inventoryDetailRepo = new inventory_detail_repo_1.InventoryDetailRepo();
        this.inventoryRepo = new inventory_repo_1.InventoryRepo();
        this.transactionWarehouseRepo = new transaction_warehouse_repo_1.TransactionWarehouseRepo();
    }
    validateUnit(unitNotFoundOrExisted, message) {
        const formattedErrors = [];
        for (const item of unitNotFoundOrExisted) {
            if (item === '0') {
                formattedErrors.push(`${message}`);
            }
            else {
                formattedErrors.push(`${message}.${item}`);
            }
        }
        if (unitNotFoundOrExisted.length > 0) {
            throw new api_error_1.APIError({
                message: message,
                status: errors_1.StatusCode.BAD_REQUEST,
                errors: formattedErrors,
            });
        }
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProductService();
        }
        return this.instance;
    }
    updateProduct(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            // await this.isExist({ code: body.code, id }, true);
            const unitNotFound = [];
            const unitExisted = [];
            const unit = yield this.unitRepo.findOne({ id: id });
            if (!unit) {
                unitNotFound.push('0');
            }
            if (body === null || body === void 0 ? void 0 : body.add) {
                for (const unit of body.add) {
                    const notFound = yield this.unitRepo.findOne({ id: unit.unit_id });
                    if (!notFound) {
                        unitExisted.push(unit.key);
                    }
                }
            }
            if (body === null || body === void 0 ? void 0 : body.delete) {
                for (const unit of body.delete) {
                    const notFound = yield this.unitRepo.findOne({ id: unit.unit_id });
                    if (!notFound) {
                        unitNotFound.push(String(unit.key));
                    }
                }
            }
            if (body === null || body === void 0 ? void 0 : body.update) {
                for (const unit of body.update) {
                    const notFound = yield this.unitRepo.findOne({ id: unit.unit_id });
                    if (!notFound) {
                        unitNotFound.push(String(unit.key));
                    }
                }
            }
            let product = null;
            if (body.product_group_id) {
                product = yield this.repo.findOne({ id: body.product_group_id });
                if (!product) {
                    throw new api_error_1.APIError({
                        message: 'product_group.not_found',
                        status: errors_1.StatusCode.BAD_REQUEST,
                        errors: [`product_group.${errors_1.ErrorKey.NOT_FOUND}`],
                    });
                }
                body.product_group = { connect: { id: body.product_group_id } };
                delete body.product_group_id;
            }
            if (body.unit_id) {
                body.unit = { connect: { id: body.unit_id } };
                delete body.unit_id;
            }
            if (unitNotFound && unitNotFound.length > 0) {
                this.validateUnit(unitExisted, 'unit_id.existed');
            }
            const output = yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const { delete: del, add, update } = body, mapperProduct = __rest(body, ["delete", "add", "update"]);
                const extra_units = { add, update, delete: body.delete };
                const updateProductId = yield this.repo.update({ id: id }, mapperProduct, tx);
                // if have product details
                // await this.handleProductDetails(id, details_add, details_update, details_delete, tx);
                yield this.handleParentProduct(id, body.code, tx);
                if ((extra_units === null || extra_units === void 0 ? void 0 : extra_units.add) && extra_units.add.length > 0) {
                    const unitsToAdd = extra_units.add.map((_a) => {
                        var { key } = _a, mapper = __rest(_a, ["key"]);
                        return Object.assign({ product_id: updateProductId }, mapper);
                    });
                    yield tx.productUnits.createMany({ data: unitsToAdd });
                }
                else if ((extra_units === null || extra_units === void 0 ? void 0 : extra_units.delete) && extra_units.delete.length > 0) {
                    for (const item of extra_units.delete) {
                        yield tx.productUnits.delete({ where: { id: item.unit_id } });
                    }
                }
                else if ((extra_units === null || extra_units === void 0 ? void 0 : extra_units.update) && extra_units.update.length > 0) {
                    const unitsToUpdate = extra_units.update.map((_a) => {
                        var { key } = _a, mapper = __rest(_a, ["key"]);
                        return mapper;
                    });
                    for (const item of unitsToUpdate) {
                        yield tx.productUnits.update({
                            where: { id: item.unit_id },
                            data: { conversion_rate: item.conversion_rate },
                        });
                    }
                }
                return updateProductId;
            }));
            if (product && body.current_price && body.current_price !== Number(product.current_price)) {
                eventbus_1.default.emit(event_constant_1.EVENT_PRODUCT_HISTORY_UPDATED, {
                    id: id,
                    current_price: body.current_price,
                });
            }
            return { id: output };
        });
    }
    createProduct(body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const unitNotFound = [];
            const unit = yield this.unitRepo.findOne({ id: body.unit_id });
            if (!unit) {
                unitNotFound.push('0');
            }
            if (body.extra_units) {
                for (const unit of body.extra_units) {
                    const notFound = yield this.unitRepo.findOne({ id: unit.unit_id });
                    if (!notFound) {
                        unitNotFound.push(unit.key);
                    }
                }
            }
            if (unitNotFound && unitNotFound.length > 0) {
                this.validateUnit(unitNotFound, 'unit_id.not_found');
            }
            const extra_units = body.extra_units && body.extra_units.length > 0
                ? {
                    create: body.extra_units.map((item) => ({
                        unit: { connect: { id: item.unit_id } },
                        conversion_rate: item.conversion_rate,
                    })),
                }
                : [];
            const checkUnit = (_a = body.extra_units) === null || _a === void 0 ? void 0 : _a.some((item) => {
                return item.unit_id === body.unit_id;
            });
            if (checkUnit) {
                throw new api_error_1.APIError({
                    message: 'common.invalid',
                    status: errors_1.StatusCode.BAD_REQUEST,
                    errors: [`extra_units.${errors_1.ErrorKey.INVALID}`],
                });
            }
            if (extra_units.length === 0) {
                delete body.extra_units;
            }
            else {
                body.extra_units = extra_units;
            }
            const restData = __rest(body, []);
            const mapData = this.autoMapConnection([restData]);
            const productId = yield this.repo.create(mapData[0]);
            // await this.productDetailService.createMany(details)
            // update product parent id
            yield this.handleParentProduct(productId, body.code);
            eventbus_1.default.emit(event_constant_1.EVENT_PRODUCT_HISTORY_UPDATED, {
                id: productId,
                current_price: body.current_price,
            });
            return { id: productId };
        });
    }
    handleParentProduct(productId, code, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!code)
                return;
            const productParent = yield this.repo.findOne({ code, id: { not: productId } }, false, tx);
            if (productParent) {
                yield this.repo.update({ id: productId }, { parent_id: productParent.id }, tx);
            }
        });
    }
    // public product
    search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.repo.paginate(query, true);
            return data;
        });
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.repo.paginate(query, true);
            result.data = this.transformProductDataStock(result.data, query.warehouseId);
            return result;
        });
    }
    transformProductDataStock(data, warehouseId) {
        return data.map((product) => {
            const value = (product.stock_trackings || []).length > 0 ? product.stock_trackings : product.stock_trackings_child;
            let stockTrackings = value || [];
            if (warehouseId) {
                stockTrackings = stockTrackings.filter((x) => x.warehouse_id === warehouseId);
            }
            const totalBalance = stockTrackings.reduce((sum, tracking) => {
                return sum + tracking.current_balance;
            }, 0);
            return Object.assign(Object.assign({}, product), { stock_trackings: stockTrackings, current_balance: totalBalance });
        });
    }
}
exports.ProductService = ProductService;
