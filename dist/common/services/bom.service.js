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
exports.BomService = void 0;
const product_repo_1 = require("../repositories/product.repo");
const work_pricing_service_1 = require("./work-pricing.service");
const unit_repo_1 = require("../repositories/unit.repo");
const bom_repo_1 = require("../repositories/bom.repo");
const base_service_1 = require("./master/base.service");
const transaction_warehouse_service_1 = require("./transaction-warehouse.service");
const bom_detail_service_1 = require("./master/bom-detail.service");
class BomService extends base_service_1.BaseService {
    constructor() {
        super(new bom_repo_1.BomRepo());
        this.productRepo = new product_repo_1.ProductRepo();
        this.unitRepo = new unit_repo_1.UnitRepo();
        this.bomDetailService = bom_detail_service_1.BomDetailService.getInstance();
        this.workPricingService = work_pricing_service_1.WorkPricingService.getInstance();
        this.transactionWarehouseService = transaction_warehouse_service_1.TransactionWarehouseService.getInstance();
        this.repo = new bom_repo_1.BomRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new BomService();
        }
        return this.instance;
    }
    createBom(body, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateForeignKeys(body, {
                product_id: this.productRepo,
            });
            let bomId = 0;
            const runTransaction = (tx) => __awaiter(this, void 0, void 0, function* () {
                const { details, work_pricings } = body, restData = __rest(body, ["details", "work_pricings"]);
                const bomData = this.autoMapConnection([restData]);
                bomId = yield this.repo.create(bomData[0], tx);
                yield this.validateForeignKeys(details, {
                    product_id: this.productRepo,
                    unit_id: this.unitRepo,
                }, tx);
                const mapBomData = this.autoMapConnection(details, { bom_id: bomId });
                yield this.bomDetailService.createMany(mapBomData, tx);
                yield this.validateForeignKeys(work_pricings, {
                    unit_id: this.unitRepo,
                    // production_step_id: this.unitRepo,
                }, tx);
                const mapWorkPricingData = this.autoMapConnection(work_pricings, { bom_id: bomId });
                yield this.workPricingService.createMany(mapWorkPricingData, tx);
            });
            if (tx) {
                yield runTransaction(tx);
            }
            else {
                yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    yield runTransaction(tx);
                }));
            }
            return { id: bomId };
        });
    }
    updateBom(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingBom = yield this.repo.findOne({ id });
            if (!existingBom)
                return { id };
            if (body.product_id) {
                yield this.validateForeignKeys(body, {
                    product_id: this.productRepo,
                });
            }
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const { add, update, delete: deleteIds, work_pricings_add, work_pricings_update, work_pricings_delete } = body, bomData = __rest(body, ["add", "update", "delete", "work_pricings_add", "work_pricings_update", "work_pricings_delete"]);
                const mapData = this.autoMapConnection([bomData]);
                yield this.repo.update({ id }, mapData[0], tx);
                yield this.handleBomDetails(id, add, update, deleteIds, tx);
                yield this.handleWorkPricings(id, work_pricings_add, work_pricings_update, work_pricings_delete, tx);
            }));
            return { id };
        });
    }
    handleBomDetails(bomId, add, update, deleteIds, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (add && (add === null || add === void 0 ? void 0 : add.length) > 0) {
                yield this.validateForeignKeys(add, {
                    product_id: this.productRepo,
                    unit_id: this.unitRepo,
                }, tx);
                const mapData = this.autoMapConnection(add, { bom_id: bomId });
                yield this.bomDetailService.createMany(mapData, tx);
            }
            if (update && (update === null || update === void 0 ? void 0 : update.length) > 0) {
                yield this.validateForeignKeys(update, {
                    product_id: this.productRepo,
                    unit_id: this.unitRepo,
                }, tx);
                const mapData = this.autoMapConnection(update);
                yield this.bomDetailService.updateMany(mapData, tx);
            }
            if (deleteIds && (deleteIds === null || deleteIds === void 0 ? void 0 : deleteIds.length) > 0) {
                yield this.bomDetailService.deleteMany(deleteIds, tx);
            }
        });
    }
    handleWorkPricings(bomId, add, update, deleteIds, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (add && (add === null || add === void 0 ? void 0 : add.length) > 0) {
                yield this.validateForeignKeys(add, {
                    // production_step_id: this.productionStepRepo,
                    unit_id: this.unitRepo,
                }, tx);
                const mapData = this.autoMapConnection(add, { bom_id: bomId });
                yield this.workPricingService.createMany(mapData, tx);
            }
            if (update && (update === null || update === void 0 ? void 0 : update.length) > 0) {
                yield this.validateForeignKeys(update, {
                    // production_step_id: this.productionStepRepo,
                    unit_id: this.unitRepo,
                }, tx);
                const mapData = this.autoMapConnection(update);
                yield this.workPricingService.updateMany(mapData, tx);
            }
            if (deleteIds && (deleteIds === null || deleteIds === void 0 ? void 0 : deleteIds.length) > 0) {
                yield this.workPricingService.deleteMany(deleteIds, tx);
            }
        });
    }
    queryMaterialEstimation(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, size = 10, keyword, startAt, endAt } = query, otherQuery = __rest(query, ["page", "size", "keyword", "startAt", "endAt"]);
            // Build where condition for order details
            const detailsWhere = Object.assign(Object.assign({ order: Object.assign(Object.assign({ type: 'production' }, (startAt &&
                    endAt && {
                    time_at: {
                        gte: new Date(startAt),
                        lte: new Date(endAt),
                    },
                })), (keyword && {
                    OR: [
                        { code: { contains: keyword, mode: 'insensitive' } },
                        { address: { contains: keyword, mode: 'insensitive' } },
                    ],
                })) }, (keyword && {
                product: {
                    name: { contains: keyword, mode: 'insensitive' },
                },
            })), otherQuery);
            // Get total count and paginated data
            const [total, orderDetails] = yield Promise.all([
                this.db.commonDetails.count({ where: detailsWhere }),
                this.db.commonDetails.findMany({
                    where: detailsWhere,
                    select: {
                        id: true,
                        quantity: true,
                        product: {
                            select: {
                                id: true,
                                name: true,
                                unit: true,
                                bom: {
                                    select: {
                                        id: true,
                                        details: {
                                            select: {
                                                id: true,
                                                quantity: true,
                                                unit: true,
                                                material: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        order: {
                            select: {
                                id: true,
                                code: true,
                                time_at: true,
                                productions: {
                                    select: {
                                        details: {
                                            select: {
                                                id: true,
                                                quantity: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    skip: (page - 1) * size,
                    take: size,
                    orderBy: {
                        order: { time_at: 'desc' },
                    },
                }),
            ]);
            return { total, orderDetails, page, size };
        });
    }
    getMaterialEstimation(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { total, orderDetails, page, size } = yield this.queryMaterialEstimation(query);
            const ordersMap = new Map();
            let orderDetailIds = [];
            let materialIds = [];
            orderDetails.forEach((detail) => {
                var _a, _b;
                if (!detail.order)
                    return; // Skip if no order data
                orderDetailIds.push(detail.id);
                const orderId = detail.order.id;
                if (!ordersMap.has(orderId)) {
                    ordersMap.set(orderId, {
                        id: detail.order.id,
                        code: detail.order.code,
                        time_at: detail.order.time_at,
                        details: [],
                        productions: detail.order.productions,
                    });
                }
                ordersMap.get(orderId).details.push({
                    id: detail.id,
                    product: detail.product,
                    quantity: detail.quantity,
                });
                // collect material ids
                (_b = (_a = detail.product) === null || _a === void 0 ? void 0 : _a.bom) === null || _b === void 0 ? void 0 : _b.details.forEach((bomDetail) => {
                    const materialId = bomDetail.material.id;
                    if (!materialIds.includes(materialId)) {
                        materialIds.push(materialId);
                    }
                });
            });
            // get warehouse and stock data
            const [txWarehouseData, stockMap] = yield Promise.all([
                this.transactionWarehouseService.getAllByOrderDetailId(orderDetailIds),
                this.transactionWarehouseService.getStockByProductIds(materialIds),
            ]);
            // create warehouse lookup map
            const txWarehouseMap = new Map();
            txWarehouseData.forEach((tx) => {
                var _a;
                const key = `${(_a = tx.inventory_detail) === null || _a === void 0 ? void 0 : _a.order_detail_id}`;
                txWarehouseMap.set(key, (txWarehouseMap.get(key) || 0) + (tx.quantity || 0));
            });
            // create stock lookup map
            // get tồn kho của các sản phẩm
            // const stockMap = await this.transactionWarehouseService.getStockByProductIds(materialIds)
            const orders = Array.from(ordersMap.values());
            const { result, boms, summary } = this.processMaterialEstimation(orders, txWarehouseMap, stockMap);
            return {
                data: result,
                boms,
                summary,
                pagination: {
                    totalRecords: total,
                    currentPage: page,
                    size,
                    totalPages: Math.ceil(total / size),
                },
            };
        });
    }
    processMaterialEstimation(orders, txWarehouseMap, stockMap) {
        const result = [];
        let totalOrderQty = 0;
        let totalProductionQty = 0;
        let materialIds = [];
        function getMaterial(material) {
            return {
                id: material.id,
                name: material.name,
                code: material.code,
            };
        }
        const allMaterials = new Map();
        orders.forEach((order) => {
            order.details.forEach((detail) => {
                var _a;
                (_a = detail.product.bom) === null || _a === void 0 ? void 0 : _a.details.forEach((bomDetail) => {
                    const materialId = bomDetail.material.id;
                    if (!allMaterials.has(materialId)) {
                        allMaterials.set(materialId, getMaterial(bomDetail.material));
                    }
                    if (!materialIds.includes(materialId)) {
                        materialIds.push(materialId);
                    }
                });
            });
        });
        const materialData = Array.from(allMaterials.values());
        const bomQtyMap = new Map();
        materialData.forEach((material) => {
            var _a;
            bomQtyMap.set(material.id, {
                material_id: material.id,
                order_qty: 0,
                production_qty: 0,
                stock_qty: ((_a = stockMap === null || stockMap === void 0 ? void 0 : stockMap.get(material.id)) === null || _a === void 0 ? void 0 : _a.stock) || 0,
            });
        });
        const orderProductGroups = new Map();
        orders.forEach((order) => {
            var _a;
            order.details.forEach((detail) => {
                var _a;
                const orderProductKey = `${order.id}_${detail.product.id}`;
                if (!orderProductGroups.has(orderProductKey)) {
                    orderProductGroups.set(orderProductKey, {
                        id: detail.id,
                        order,
                        product: detail.product,
                        order_quantity: 0,
                        production_quantity: 0,
                        materials: new Map(),
                    });
                }
                const group = orderProductGroups.get(orderProductKey);
                group.order_quantity += detail.quantity;
                (_a = detail.product.bom) === null || _a === void 0 ? void 0 : _a.details.forEach((bomDetail) => {
                    const materialId = bomDetail.material.id;
                    if (!group.materials.has(materialId)) {
                        group.materials.set(materialId, {
                            material: getMaterial(bomDetail.material),
                            quantity: bomDetail.quantity,
                        });
                    }
                });
            });
            // Add production quantities
            (_a = order.productions) === null || _a === void 0 ? void 0 : _a.forEach((production) => {
                var _a;
                (_a = production.details) === null || _a === void 0 ? void 0 : _a.forEach((prodDetail) => {
                    const orderProductKey = `${order.id}_${prodDetail.product.id}`;
                    const group = orderProductGroups.get(orderProductKey);
                    if (group) {
                        group.production_quantity += prodDetail.quantity;
                    }
                });
            });
        });
        // Convert to result format
        orderProductGroups.forEach((group) => {
            const exported_warehouse = txWarehouseMap.get(`${group.id}`) || 0;
            totalOrderQty += group.order_quantity;
            totalProductionQty += group.production_quantity;
            const order_remaining = group.order_quantity - exported_warehouse;
            const production_remaining = group.production_quantity - exported_warehouse;
            const row = {
                id: group.order.id,
                code: group.order.code,
                time_at: group.order.time_at,
                product: {
                    id: group.product.id,
                    name: group.product.name,
                },
                exported_warehouse,
                order_qty: group.order_quantity,
                production_qty: group.production_quantity,
                boms: materialData.map((materialObj) => {
                    const materialData = group.materials.get(materialObj.id);
                    if (materialData) {
                        const order_qty_calc = materialData.quantity * order_remaining;
                        const production_qty_calc = materialData.quantity * production_remaining;
                        const bomItem = bomQtyMap.get(materialObj.id);
                        bomItem.order_qty += order_qty_calc;
                        bomItem.production_qty += production_qty_calc;
                        return {
                            material: materialData.material,
                            value: materialData.quantity,
                            order_qty: materialData.quantity * order_remaining,
                            production_qty: materialData.quantity * production_remaining,
                        };
                    }
                    return {
                        material: materialObj,
                        value: 0,
                        order_qty: 0,
                        production_qty: 0,
                    };
                }),
            };
            result.push(row);
        });
        const boms = Array.from(bomQtyMap.values());
        return {
            result,
            boms,
            summary: {
                order_qty: totalOrderQty,
                production_qty: totalProductionQty,
            },
        };
    }
}
exports.BomService = BomService;
