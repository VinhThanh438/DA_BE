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
exports.InventoryService = void 0;
const base_service_1 = require("./master/base.service");
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const calculate_convert_qty_1 = require("../helpers/calculate-convert-qty");
const common_detail_repo_1 = require("../repositories/common-detail.repo");
const employee_repo_1 = require("../repositories/employee.repo");
const inventory_detail_repo_1 = require("../repositories/inventory-detail.repo");
const inventory_repo_1 = require("../repositories/inventory.repo");
const order_repo_1 = require("../repositories/order.repo");
const organization_repo_1 = require("../repositories/organization.repo");
const partner_repo_1 = require("../repositories/partner.repo");
const transaction_warehouse_repo_1 = require("../repositories/transaction-warehouse.repo");
const warehouse_repo_1 = require("../repositories/warehouse.repo");
const app_constant_1 = require("../../config/app.constant");
const common_detail_service_1 = require("./common-detail.service");
const handle_files_1 = require("../helpers/handle-files");
const transform_util_1 = require("../helpers/transform.util");
const shipping_plan_repo_1 = require("../repositories/shipping-plan.repo");
const eventbus_1 = __importDefault(require("../eventbus"));
const event_constant_1 = require("../../config/event.constant");
const common_service_1 = require("./common.service");
const logger_1 = __importDefault(require("../logger"));
const transaction_repo_1 = require("../repositories/transaction.repo");
const time_adapter_1 = require("../infrastructure/time.adapter");
const stock_tracking_service_1 = require("./master/stock-tracking.service");
const prisma_select_1 = require("../repositories/prisma/prisma.select");
const transaction_warehouse_service_1 = require("./transaction-warehouse.service");
const order_service_1 = require("./order.service");
class InventoryService extends base_service_1.BaseService {
    constructor() {
        super(new inventory_repo_1.InventoryRepo());
        this.inventoryDetailRepo = new inventory_detail_repo_1.InventoryDetailRepo();
        this.partnerRepo = new partner_repo_1.PartnerRepo();
        this.employeeRepo = new employee_repo_1.EmployeeRepo();
        this.organizationRepo = new organization_repo_1.OrganizationRepo();
        this.orderRepo = new order_repo_1.OrderRepo();
        this.warehouseRepo = new warehouse_repo_1.WarehouseRepo();
        this.orderDetailRepo = new common_detail_repo_1.CommonDetailRepo();
        this.shippingPlanRepo = new shipping_plan_repo_1.ShippingPlanRepo();
        this.transactionWarehouseRepo = new transaction_warehouse_repo_1.TransactionWarehouseRepo();
        this.commonDetailService = common_detail_service_1.CommonDetailService.getInstance();
        this.stockTrackingService = stock_tracking_service_1.StockTrackingService.getInstance();
        this.transactionRepo = new transaction_repo_1.TransactionRepo();
        this.transWService = transaction_warehouse_service_1.TransactionWarehouseService.getInstance();
        this.orderService = order_service_1.OrderService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new InventoryService();
        }
        return this.instance;
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { productIds, warehouseIds, supplierIds, deliveryIds } = query, restQuery = __rest(query, ["productIds", "warehouseIds", "supplierIds", "deliveryIds"]);
            // supplier = partner in order
            // delivery = partner in shipping plan
            const detailAndConditions = [];
            if (productIds === null || productIds === void 0 ? void 0 : productIds.length) {
                detailAndConditions.push({
                    order_detail: {
                        product_id: { in: productIds },
                    },
                });
            }
            const detailCondition = detailAndConditions.length > 0 ? { AND: detailAndConditions } : {};
            const where = Object.assign(Object.assign(Object.assign(Object.assign({}, (detailAndConditions.length > 0 && {
                details: {
                    some: { AND: detailAndConditions },
                },
            })), (deliveryIds &&
                deliveryIds.length > 0 && {
                shipping_plan: {
                    partner_id: { in: deliveryIds },
                },
            })), (supplierIds &&
                supplierIds.length > 0 && {
                order: {
                    partner_id: { in: supplierIds },
                },
            })), (warehouseIds &&
                warehouseIds.length > 0 && {
                warehouse_id: { in: warehouseIds },
            }));
            const selectCondition = {
                details: {
                    where: detailCondition,
                    select: prisma_select_1.InventoryDetailSelectionAll,
                },
            };
            const result = yield this.repo.paginate(restQuery, true, where, selectCondition);
            result.data = result.data.map((item) => {
                var _a;
                return Object.assign(Object.assign({}, item), { order: Object.assign(Object.assign({}, item === null || item === void 0 ? void 0 : item.order), { details: (_a = item === null || item === void 0 ? void 0 : item.order) === null || _a === void 0 ? void 0 : _a.details.map((detail) => (Object.assign(Object.assign({}, detail), { product: common_service_1.CommonService.transformProductDataStock(detail.product || {}) }))) }) });
            });
            return result;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = (yield this.repo.findOne({ id }, true));
            if (!data) {
                throw new api_error_1.APIError({
                    message: 'common.not-found',
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`id.${errors_1.ErrorKey.NOT_FOUND}`],
                });
            }
            return Object.assign(Object.assign({}, data), { order: data.order
                    ? Object.assign(Object.assign({}, data.order), { details: (((_a = data === null || data === void 0 ? void 0 : data.order) === null || _a === void 0 ? void 0 : _a.details) || []).map((detail) => (Object.assign(Object.assign({}, detail), { product: common_service_1.CommonService.transformProductDataStock(detail.product) }))) }) : undefined });
        });
    }
    createInventory(request, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            let inventoryId = 0;
            yield this.isExist({ code: request.code });
            yield this.validateForeignKeys(request, {
                customer_id: this.partnerRepo,
                supplier_id: this.partnerRepo,
                delivery_id: this.partnerRepo,
                shipping_plan_id: this.shippingPlanRepo,
                employee_id: this.employeeRepo,
                organization_id: this.organizationRepo,
                order_id: this.orderRepo,
                warehouse_id: this.warehouseRepo,
            }, tx);
            const runTransaction = (transaction) => __awaiter(this, void 0, void 0, function* () {
                const { details, order_id, type, warehouse_id } = request, inventoryData = __rest(request, ["details", "order_id", "type", "warehouse_id"]);
                // check dung sai
                const existingOrder = yield this.orderRepo.findOne({ id: order_id }, false, transaction);
                const tolerance = (existingOrder === null || existingOrder === void 0 ? void 0 : existingOrder.tolerance) || 0;
                if (details && details.length > 0) {
                    if (type && app_constant_1.InventoryTypeIn.includes(type) && details && details.length > 0 && warehouse_id) {
                        // need fix this function
                        // await this.validateStockForExport(details, warehouse_id, transaction);
                        yield this.checkProductAndOrderTolerances(order_id || 0, details, tolerance, transaction);
                    }
                }
                // Kiểm tra tồn kho cho phiếu xuất kho
                if (type && app_constant_1.InventoryTypeOut.includes(type) && details && details.length > 0 && warehouse_id) {
                    // need fix this function
                    // await this.validateStockForExport(details, warehouse_id, transaction);
                }
                let content = '';
                if (details && details.length > 0) {
                    content = yield common_service_1.CommonService.getContent(details);
                }
                const body = this.autoMapConnection([Object.assign({ order_id, type, warehouse_id }, inventoryData)]);
                inventoryId = yield this.repo.create(body[0], transaction);
                if (details && details.length > 0) {
                    yield this.validateForeignKeys(details, { order_detail_id: this.orderDetailRepo }, transaction);
                    const mappedDetails = this.autoMapConnection(details, {
                        inventory_id: inventoryId,
                    });
                    yield this.inventoryDetailRepo.createMany(mappedDetails, transaction);
                }
                else {
                    throw new api_error_1.APIError({
                        message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: [`details.${errors_1.ErrorKey.INVALID}`],
                    });
                }
            });
            if (tx) {
                yield runTransaction(tx);
            }
            else {
                yield this.db.$transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                    yield runTransaction(transaction);
                }));
            }
            eventbus_1.default.emit(event_constant_1.EVENT_CREATE_GATELOG, {
                inventory: inventoryId ? { connect: { id: inventoryId } } : undefined,
                organization_id: request.organization_id,
            });
            return { id: inventoryId };
        });
    }
    processFIFOExportV2(inventoryDetails, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            for (const detail of inventoryDetails) {
                const inventoryDetailData = yield tx.inventoryDetails.findFirst({
                    where: { id: detail.id },
                    select: prisma_select_1.InventoryDetailSelectionImportDetail,
                });
                if (!inventoryDetailData)
                    continue;
                const inventoryDetail = Object.assign(Object.assign({}, inventoryDetailData), { order_detail: Object.assign(Object.assign({}, inventoryDetailData.order_detail), { product: common_service_1.CommonService.transformProductDataStock((_a = inventoryDetailData === null || inventoryDetailData === void 0 ? void 0 : inventoryDetailData.order_detail) === null || _a === void 0 ? void 0 : _a.product) }) });
                const product = (_b = inventoryDetail.order_detail) === null || _b === void 0 ? void 0 : _b.product;
                if (!product)
                    continue;
                const { id: inventoryDetailId, real_quantity, inventory } = inventoryDetail;
                const warehouseId = (inventory === null || inventory === void 0 ? void 0 : inventory.warehouse_id) || 0;
                if (!warehouseId)
                    continue;
                try {
                    const { money, transactionWarehouses, stockTrackingUpdates, stockTrackingsToDelete } = (0, calculate_convert_qty_1.calculateFIFOExportValue)(product, real_quantity);
                    // 1. create transaction warehouses
                    const transferTransW = transactionWarehouses.map((t) => (Object.assign(Object.assign({}, t), { warehouse_id: warehouseId, inventory_detail_id: inventoryDetailId, time_at: inventory === null || inventory === void 0 ? void 0 : inventory.time_at, order_id: inventory === null || inventory === void 0 ? void 0 : inventory.order_id, inventory_id: inventory === null || inventory === void 0 ? void 0 : inventory.id })));
                    yield this.transWService.createMany(transferTransW, tx);
                    // 2. delete stock trackings with zero balance
                    yield this.stockTrackingService.deleteMany(stockTrackingsToDelete, tx);
                    // 3. update stock tracking balances
                    for (const update of stockTrackingUpdates) {
                        const { id, current_balance } = update;
                        yield this.stockTrackingService.updateItem(id, { current_balance }, tx);
                    }
                    // 4. update inventory detail with money
                    yield this.inventoryDetailRepo.update({ id: inventoryDetailId }, { real_money: money }, tx);
                }
                catch (error) {
                    throw new api_error_1.APIError({
                        message: `FIFO Export Error:`,
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: [`product_id.insufficient_stock`],
                    });
                }
            }
        });
    }
    updateInventory(id, request, isAdmin) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { delete: deleteIds, update, add, details, files_add, files_delete } = request, body = __rest(request, ["delete", "update", "add", "details", "files_add", "files_delete"]);
            const inventoryData = yield this.canEdit(id, 'inventory', isAdmin, true);
            // Check if inventory is confirmed and restrict editing after 90 days
            const confirmedAt = time_adapter_1.TimeAdapter.parseToDate(inventoryData.confirmed_at).getTime();
            const now = time_adapter_1.TimeAdapter.getCurrentDate().getTime();
            const diffDays = Math.floor((now - confirmedAt) / (1000 * 60 * 60 * 24));
            if (diffDays >= 90 && !inventoryData.is_update_locked) {
                eventbus_1.default.emit(event_constant_1.EVENT_DISABLE_UPDATE_INVENTORY, { id: inventoryData.id });
                throw new api_error_1.APIError({
                    message: `common.status.edit-restriction-warning`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`inventory.${errors_1.ErrorKey.CANNOT_EDIT}`],
                });
            }
            try {
                const inventoryExist = yield this.findById(id);
                yield this.isExist({ code: request.code, id }, true);
                yield this.validateForeignKeys(request, {
                    customer_id: this.partnerRepo,
                    supplier_id: this.partnerRepo,
                    shipping_plan_id: this.shippingPlanRepo,
                    employee_id: this.employeeRepo,
                    organization_id: this.organizationRepo,
                    order_id: this.orderRepo,
                });
                const isAdminEdit = isAdmin && (inventoryExist === null || inventoryExist === void 0 ? void 0 : inventoryExist.status) === app_constant_1.CommonApproveStatus.CONFIRMED;
                // handle files
                let filesUpdate = (0, handle_files_1.handleFiles)(files_add, files_delete, inventoryExist === null || inventoryExist === void 0 ? void 0 : inventoryExist.files);
                yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
                    const updatedInventory = yield tx.inventories.update({
                        where: { id },
                        data: Object.fromEntries(Object.entries(Object.assign(Object.assign({}, body), (filesUpdate !== null && { files: filesUpdate }))).filter(([_, v]) => v !== undefined)),
                    });
                    // Gom tất cả thay đổi về TransactionWarehouses
                    const transactionChanges = {
                        toCreate: [],
                        toUpdate: [],
                        toDelete: [],
                    };
                    // [add] order details
                    let convertQtyUpdate = 0;
                    if (add && add.length > 0) {
                        yield this.validateForeignKeys(add, { order_detail_id: this.orderDetailRepo }, tx);
                        const data = add.map((item) => {
                            const { key, order_detail } = item, rest = __rest(item, ["key", "order_detail"]);
                            return Object.assign(Object.assign({}, rest), { inventory_id: id });
                        });
                        const createdDetails = yield this.inventoryDetailRepo.createMany(data, tx); // Gom transaction cần tạo
                        if (isAdminEdit) {
                            for (let i = 0; i < createdDetails.length; i++) {
                                const createdDetail = createdDetails[i];
                                const originalItem = add[i];
                                // Xử lý theo loại inventory (in/out)
                                let finalQuantity = createdDetail.quantity;
                                let finalRealQuantity = createdDetail.real_quantity;
                                if (updatedInventory.type && app_constant_1.InventoryTypeOut.includes(updatedInventory.type)) {
                                    // Phiếu xuất kho: xử lý logic riêng
                                    if (createdDetail.real_quantity !== null && createdDetail.real_quantity !== undefined) {
                                        // Nếu có real_quantity thì lấy giá trị của real_quantity
                                        finalQuantity = createdDetail.real_quantity;
                                        finalRealQuantity = createdDetail.real_quantity;
                                    }
                                    else {
                                        // Nếu không có real_quantity thì quantity = quantity - quantity_adjustment
                                        const adjustmentQty = createdDetail.quantity_adjustment || 0;
                                        finalQuantity = (createdDetail.quantity || 0) - adjustmentQty;
                                        finalRealQuantity = finalQuantity;
                                    }
                                }
                                const valueConverted = (0, calculate_convert_qty_1.calculateConvertQty)(Object.assign(Object.assign({}, originalItem.order_detail), { quantity: finalQuantity })) || 0;
                                transactionChanges.toCreate.push({
                                    inventory_detail_id: createdDetail.id,
                                    inventory_id: id,
                                    order_id: updatedInventory.order_id,
                                    warehouse_id: updatedInventory.warehouse_id,
                                    product_id: ((_b = (_a = originalItem === null || originalItem === void 0 ? void 0 : originalItem.order_detail) === null || _a === void 0 ? void 0 : _a.product) === null || _b === void 0 ? void 0 : _b.id) || 0,
                                    real_quantity: finalRealQuantity,
                                    quantity: finalQuantity,
                                    convert_quantity: valueConverted,
                                    type: app_constant_1.InventoryTypeDirectionMap[updatedInventory.type],
                                    time_at: updatedInventory.time_at,
                                    note: createdDetail.note,
                                    organization_id: updatedInventory.organization_id,
                                });
                                convertQtyUpdate += valueConverted || 0;
                            }
                            yield this.transactionWarehouseRepo.createMany(transactionChanges.toCreate, tx);
                        }
                    }
                    // [update] order details
                    if (update && update.length > 0) {
                        yield this.validateForeignKeys(update, {
                            id: this.inventoryDetailRepo,
                        }, tx);
                        const data = update.map((item) => {
                            const { key, order_detail } = item, rest = __rest(item, ["key", "order_detail"]);
                            return rest;
                        });
                        yield this.inventoryDetailRepo.updateMany(data, tx);
                        if (isAdminEdit) {
                            // Gom transaction cần update
                            for (const item of update) {
                                const { key, id: detailId } = item, detailData = __rest(item, ["key", "id"]);
                                const originalDetail = yield this.inventoryDetailRepo.findOne({ id: detailId }, false, tx);
                                if (!originalDetail)
                                    continue;
                                // Tìm transaction tương ứng
                                const existingTransaction = yield this.transactionWarehouseRepo.findOne({
                                    inventory_detail_id: detailId,
                                }, false, tx);
                                if (existingTransaction) {
                                    // Xử lý theo loại inventory (in/out)
                                    let finalQuantity = detailData.quantity || 0;
                                    let finalRealQuantity = detailData.real_quantity;
                                    if (updatedInventory.type &&
                                        app_constant_1.InventoryTypeOut.includes(updatedInventory.type)) {
                                        // Phiếu xuất kho: xử lý logic riêng
                                        if (detailData.real_quantity !== null && detailData.real_quantity !== undefined) {
                                            // Nếu có real_quantity thì lấy giá trị của real_quantity
                                            finalQuantity = detailData.real_quantity;
                                            finalRealQuantity = detailData.real_quantity;
                                        }
                                        else {
                                            // Nếu không có real_quantity thì quantity = quantity - quantity_adjustment
                                            const adjustmentQty = detailData.quantity_adjustment || 0;
                                            finalQuantity = (detailData.quantity || 0) - adjustmentQty;
                                            finalRealQuantity = finalQuantity;
                                        }
                                    }
                                    const valueConverted = (0, calculate_convert_qty_1.calculateConvertQty)(Object.assign(Object.assign({}, detailData.order_detail), { quantity: finalQuantity })) || 0;
                                    // const diff = valueConverted - (existingTransaction.convert_quantity || 0);
                                    const diff = finalQuantity - (existingTransaction.quantity || 0);
                                    transactionChanges.toUpdate.push({
                                        id: existingTransaction.id,
                                        real_quantity: finalRealQuantity,
                                        quantity: finalQuantity,
                                        convert_quantity: valueConverted,
                                        note: detailData.note,
                                        time_at: updatedInventory.time_at,
                                        // product_id: detailData.order_detail?.product?.id,
                                    });
                                    //    update if quantity changed
                                    if (((_c = detailData === null || detailData === void 0 ? void 0 : detailData.order_detail) === null || _c === void 0 ? void 0 : _c.id) &&
                                        // valueConverted !== existingTransaction.convert_quantity
                                        finalQuantity !== existingTransaction.quantity) {
                                        // Đối với phiếu xuất kho, cần update theo hướng ngược lại
                                        const updateType = app_constant_1.InventoryTypeOut.includes(updatedInventory.type)
                                            ? 'decrease'
                                            : 'increase';
                                        const updateQuantity = Math.abs(diff);
                                        yield this.commonDetailService.updateImportQuantity({ id: detailData.order_detail.id }, {
                                            type: diff > 0
                                                ? updateType
                                                : updateType === 'increase'
                                                    ? 'decrease'
                                                    : 'increase',
                                            quantity: updateQuantity,
                                        }, tx);
                                    }
                                }
                            }
                            if (transactionChanges.toUpdate.length > 0) {
                                yield this.transactionWarehouseRepo.updateMany(transactionChanges.toUpdate, tx);
                            }
                        }
                    }
                    // [delete] order details
                    if (deleteIds && deleteIds.length > 0) {
                        if (isAdminEdit) {
                            // const detailsToDelete = await this.inventoryDetailRepo.findMany(
                            //     { id: { in: deleteIds } },
                            //     false,
                            //     // tx,
                            // );
                            const detailsToDelete = yield tx.inventoryDetails.findMany({
                                where: { id: { in: deleteIds } },
                                select: prisma_select_1.InventoryDetailSelectionProduct,
                            });
                            for (const detail of detailsToDelete) {
                                if (detail.order_detail_id) {
                                    // Xử lý theo loại inventory (in/out)
                                    let finalQuantity = detail.quantity || 0;
                                    if (updatedInventory.type &&
                                        app_constant_1.InventoryTypeOut.includes(updatedInventory.type)) {
                                        // Phiếu xuất kho: xử lý logic riêng
                                        if (detail.real_quantity !== null && detail.real_quantity !== undefined) {
                                            // Nếu có real_quantity thì lấy giá trị của real_quantity
                                            finalQuantity = detail.real_quantity;
                                        }
                                        else {
                                            // Nếu không có real_quantity thì quantity = quantity - quantity_adjustment
                                            const adjustmentQty = detail.quantity_adjustment || 0;
                                            finalQuantity = (detail.quantity || 0) - adjustmentQty;
                                        }
                                    }
                                    // Đối với phiếu xuất kho khi delete, cần update ngược lại (increase thay vì decrease)
                                    const updateType = updatedInventory.type && app_constant_1.InventoryTypeOut.includes(updatedInventory.type)
                                        ? 'increase'
                                        : 'decrease';
                                    yield this.commonDetailService.updateImportQuantity({ id: detail.order_detail_id }, {
                                        type: updateType,
                                        quantity: finalQuantity,
                                    }, tx);
                                }
                            }
                        }
                        yield this.inventoryDetailRepo.deleteMany({ id: { in: deleteIds } }, tx, false);
                    }
                }));
                // update is done in order
                if ((inventoryExist === null || inventoryExist === void 0 ? void 0 : inventoryExist.order_id) && isAdminEdit) {
                    const orderDetails = yield this.orderDetailRepo.findMany({ order_id: inventoryExist === null || inventoryExist === void 0 ? void 0 : inventoryExist.order_id }, true);
                    let initQty = 0;
                    if (!orderDetails || orderDetails.length === 0)
                        initQty = 0;
                    initQty = orderDetails.reduce((total, detail) => {
                        const convertedQuantity = (0, calculate_convert_qty_1.calculateConvertQty)(detail);
                        return total + convertedQuantity;
                    }, 0);
                    const importQty = yield this.transactionWarehouseRepo.aggregate({ order_id: inventoryExist === null || inventoryExist === void 0 ? void 0 : inventoryExist.order_id, type: 'in' }, {
                        _sum: {
                            convert_quantity: true,
                        },
                    });
                    const percent = initQty > 0 ? ((((_a = importQty === null || importQty === void 0 ? void 0 : importQty._sum) === null || _a === void 0 ? void 0 : _a.convert_quantity) || 0) / initQty) * 100 : 0;
                    const orderData = yield this.orderRepo.findOne({ id: inventoryData.order_id }, false);
                    const isDone = percent >= 100 - ((orderData === null || orderData === void 0 ? void 0 : orderData.tolerance) || 0);
                    yield this.orderRepo.update({ id: inventoryExist === null || inventoryExist === void 0 ? void 0 : inventoryExist.order_id }, { delivery_progress: percent, isDone });
                }
                // clean up file
                if (files_delete && files_delete.length > 0) {
                    eventbus_1.default.emit(event_constant_1.EVENT_DELETE_UNUSED_FILES, files_delete);
                }
                return { id };
            }
            catch (error) {
                if (files_add && files_add.length > 0) {
                    eventbus_1.default.emit(event_constant_1.EVENT_DELETE_UNUSED_FILES, files_add);
                }
                throw error;
            }
        });
    }
    handleApprove(id, inventoryData, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            let totalInitQty = 0;
            let totalImportQty = 0;
            const warehouseTransactionData = [];
            const inventoryDetails = yield tx.inventoryDetails.findMany({
                where: { inventory_id: id },
                select: prisma_select_1.InventoryDetailSelectionProduct,
            });
            for (const item of inventoryDetails) {
                if (!item.order_detail_id)
                    continue;
                // Xử lý theo loại inventory (in/out)
                let finalQuantity = item.quantity || 0;
                let finalRealQuantity = item.real_quantity || 0;
                if (inventoryData.type && app_constant_1.InventoryTypeOut.includes(inventoryData.type)) {
                    // Phiếu xuất kho: xử lý logic riêng
                    if (item.real_quantity !== null && item.real_quantity !== undefined) {
                        // Nếu có real_quantity thì lấy giá trị của real_quantity
                        finalQuantity = item.real_quantity;
                        finalRealQuantity = item.real_quantity;
                    }
                    else {
                        // Nếu không có real_quantity thì quantity = quantity - quantity_adjustment
                        const adjustmentQty = item.quantity_adjustment || 0;
                        finalQuantity = (item.quantity || 0) - adjustmentQty;
                        finalRealQuantity = finalQuantity;
                    }
                }
                const valueConverted = (0, calculate_convert_qty_1.calculateConvertQty)(Object.assign(Object.assign({}, item.order_detail), { quantity: finalRealQuantity }));
                const productData = (_a = item.order_detail) === null || _a === void 0 ? void 0 : _a.product;
                const unitData = (_b = item.order_detail) === null || _b === void 0 ? void 0 : _b.unit;
                const productId = productData.parent_id || productData.id;
                const childId = productData.parent_id ? productData.id : undefined;
                const orderDetailPrice = Number((_c = item.order_detail) === null || _c === void 0 ? void 0 : _c.price);
                warehouseTransactionData.push(Object.assign(Object.assign({ real_quantity: finalRealQuantity, convert_quantity: valueConverted || 0, quantity: finalQuantity, inventory: { connect: { id: id } }, inventory_detail: { connect: { id: item.id } }, warehouse: { connect: { id: inventoryData.warehouse_id } }, order: { connect: { id: inventoryData.order_id } }, product: { connect: { id: productId } } }, ((productData === null || productData === void 0 ? void 0 : productData.parent_id) && { child: { connect: { id: productData.id } } })), { type: app_constant_1.InventoryTypeDirectionMap[inventoryData.type], time_at: inventoryData.time_at, 
                    // more
                    current_balance: valueConverted, product_id: productId, child_id: childId, warehouse_id: inventoryData.warehouse_id || 0, price: orderDetailPrice / (0, calculate_convert_qty_1.getConversionRate)(productData, unitData) }));
                // Đối với phiếu xuất kho, cần update theo hướng ngược lại
                const updateType = app_constant_1.InventoryTypeOut.includes(inventoryData.type) ? 'decrease' : 'increase';
                const qtyInfo = yield this.commonDetailService.updateImportQuantity({ id: item.order_detail_id }, { type: updateType, quantity: finalQuantity }, tx);
                totalImportQty += (qtyInfo === null || qtyInfo === void 0 ? void 0 : qtyInfo.newQty) || 0;
                totalInitQty += (qtyInfo === null || qtyInfo === void 0 ? void 0 : qtyInfo.qty) || 0;
            }
            yield this.transactionWarehouseRepo.deleteMany({ inventory_id: id }, tx);
            // insert data to transaction warehouse
            let stockTrackingData = [];
            for (const transactionData of warehouseTransactionData) {
                const { product_id, child_id, warehouse_id, current_balance } = transactionData, restData = __rest(transactionData, ["product_id", "child_id", "warehouse_id", "current_balance"]);
                const transW = yield tx.transactionWarehouses.create({ data: restData });
                stockTrackingData.push({
                    product_id,
                    child_id,
                    warehouse_id,
                    price: restData.price,
                    current_balance,
                    transaction_warehouse_id: transW.id,
                    time_at: transW.time_at,
                });
            }
            // update is done in order
            if (inventoryData.order_id) {
                const orderInfo = yield tx.orders.findFirst({
                    where: { id: inventoryData.order_id },
                    select: prisma_select_1.OrderSelectionDetails,
                });
                if (!orderInfo)
                    return;
                const orderDetails = (orderInfo === null || orderInfo === void 0 ? void 0 : orderInfo.details) || [];
                const initQty = orderDetails.reduce((total, detail) => {
                    const convertedQuantity = (0, calculate_convert_qty_1.calculateConvertQty)(detail);
                    return total + convertedQuantity;
                }, 0) || 0;
                const sumQty = yield this.transWService.sumQtyByOrder(orderInfo, tx);
                yield this.orderService.calculateAndUpdateOrderProcessing(orderInfo, sumQty, initQty, tx);
                // update shipping plan if exists
                const shippingPlans = yield this.shippingPlanRepo.findMany({ order_id: inventoryData.order_id, status: app_constant_1.ShippingPlanStatus.CONFIRMED }, false, tx);
                for (const spl of shippingPlans) {
                    const updateConditions = {
                        completed_quantity: Number(spl.completed_quantity) + 1,
                    };
                    // khong co hoa don va hoan thanh het => Tao phat sinh tang trong cong no van chuyen
                    if (spl.vat === 0 && Number(spl.completed_quantity) === Number(spl.quantity) - 1) {
                        const totalPrice = Number(spl.price) * Number(spl.quantity);
                        yield this.transactionRepo.create({
                            type: app_constant_1.TransactionType.OUT,
                            order_type: app_constant_1.TransactionOrderType.DELIVERY,
                            amount: totalPrice,
                            shipping_plan: { connect: { id: spl.id } },
                            time_at: inventoryData.time_at,
                            organization: { connect: { id: inventoryData.organization_id } },
                            partner: { connect: { id: spl.partner_id } },
                            order: { connect: { id: spl.order_id } },
                            note: 'Phát sinh tăng công nợ trong quá trình vận chuyển không có VAT',
                        }, tx);
                        updateConditions.is_done = true;
                    }
                    yield this.shippingPlanRepo.update({ id: spl.id }, updateConditions, tx);
                    logger_1.default.info(`Shipping plan ${spl.id} updated with completed quantity: ${updateConditions.completed_quantity}`);
                }
            }
            yield this.stockTrackingService.createMany(stockTrackingData, tx);
        });
    }
    approve(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const inventoryData = yield this.validateStatusApprove(id);
            const inventories = yield this.repo.findOne({ id }, false);
            if (inventories && inventories.type && app_constant_1.InventoryTypeOut.includes(inventories.type)) {
                yield this.approveExportInventory(id, body);
            }
            else {
                try {
                    yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                        yield this.repo.update({ id }, body, tx);
                        yield this.handleApprove(id, inventoryData, tx);
                    }));
                }
                catch (error) {
                    throw error;
                }
            }
            eventbus_1.default.emit(event_constant_1.EVENT_INVENTORY_APPROVED, { id, status: body.status });
            return { id };
        });
    }
    deleteInventory(id, isAdmin) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.canEdit(id, 'inventory', isAdmin);
                yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const detailsToDelete = yield this.inventoryDetailRepo.findMany({ inventory_id: id }, false, tx);
                    // Lấy thông tin inventory để biết type
                    const inventory = yield this.repo.findOne({ id }, false, tx);
                    for (const detail of detailsToDelete) {
                        if (detail.order_detail_id) {
                            // Xử lý theo loại inventory (in/out)
                            let finalQuantity = detail.quantity || 0;
                            if ((inventory === null || inventory === void 0 ? void 0 : inventory.type) && app_constant_1.InventoryTypeOut.includes(inventory.type)) {
                                // Phiếu xuất kho: xử lý logic riêng
                                if (detail.real_quantity !== null && detail.real_quantity !== undefined) {
                                    // Nếu có real_quantity thì lấy giá trị của real_quantity
                                    finalQuantity = detail.real_quantity;
                                }
                                else {
                                    // Nếu không có real_quantity thì quantity = quantity - quantity_adjustment
                                    const adjustmentQty = detail.quantity_adjustment || 0;
                                    finalQuantity = (detail.quantity || 0) - adjustmentQty;
                                }
                            }
                            // Đối với phiếu xuất kho khi delete, cần update ngược lại (increase thay vì decrease)
                            const updateType = (inventory === null || inventory === void 0 ? void 0 : inventory.type) && app_constant_1.InventoryTypeOut.includes(inventory.type)
                                ? 'increase'
                                : 'decrease';
                            yield this.commonDetailService.updateImportQuantity({ id: detail.order_detail_id }, {
                                type: updateType,
                                quantity: finalQuantity,
                            }, tx);
                        }
                    }
                    yield this.repo.delete({ id }, tx);
                }));
                return { id };
            }
            catch (error) {
                throw error;
            }
        });
    }
    getInventoryReport(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startAt, endAt, warehouseIds, productIds } = query;
            const baseWhere = Object.assign(Object.assign({}, (productIds && productIds.length > 0 && { product_id: { in: productIds } })), (warehouseIds && { warehouse_id: { in: warehouseIds } }));
            const transactions = yield this.db.transactionWarehouses.findMany({
                where: Object.assign(Object.assign({}, baseWhere), { time_at: { lte: endAt } }),
                select: {
                    product_id: true,
                    type: true,
                    // real_quantity: true,
                    convert_quantity: true,
                    price: true,
                    time_at: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            unit: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    warehouse: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { time_at: 'asc' },
            });
            const productReports = new Map();
            transactions.forEach((transaction) => {
                const productId = transaction.product_id;
                if (!productId)
                    return;
                if (!productReports.has(productId)) {
                    productReports.set(productId, {
                        product: transaction.product,
                        warehouse: transaction.warehouse,
                        beforePeriodImport: 0,
                        beforePeriodExport: 0,
                        inPeriodImport: 0,
                        inPeriodExport: 0,
                        totalImport: 0,
                        totalExport: 0,
                        beforePeriodImportMoney: 0,
                        beforePeriodExportMoney: 0,
                        inPeriodImportMoney: 0,
                        inPeriodExportMoney: 0,
                        totalImportMoney: 0,
                        totalExportMoney: 0,
                    });
                }
                const report = productReports.get(productId);
                const quantity = transaction.convert_quantity || 0;
                const price = transaction.price || 0;
                const money = quantity * price;
                const startDate = startAt ? new Date(startAt) : undefined;
                const endDate = endAt ? new Date(endAt) : undefined;
                const isInPeriod = startDate && endDate ? transaction.time_at >= startDate && transaction.time_at <= endDate : false;
                const isBeforePeriod = startDate ? transaction.time_at < startDate : false;
                if (transaction.type === 'in') {
                    report.totalImport += quantity;
                    if (isInPeriod)
                        report.inPeriodImport += quantity;
                    if (isBeforePeriod)
                        report.beforePeriodImport += quantity;
                    // Money
                    report.totalImportMoney += money;
                    report.totalImportValue += money;
                    if (isInPeriod)
                        report.inPeriodImportMoney += money;
                    if (isBeforePeriod)
                        report.beforePeriodImportMoney += money;
                }
                else if (transaction.type === 'out') {
                    report.totalExport += quantity;
                    if (isInPeriod)
                        report.inPeriodExport += quantity;
                    if (isBeforePeriod)
                        report.beforePeriodExport += quantity;
                    // Money
                    report.totalExportMoney += money;
                    report.totalExportValue += money;
                    if (isInPeriod)
                        report.inPeriodExportMoney += money;
                    if (isBeforePeriod)
                        report.beforePeriodExportMoney += money;
                }
            });
            const reports = Array.from(productReports.values()).map((report) => {
                const beginningQty = report.beforePeriodImport - report.beforePeriodExport;
                const increaseQty = report.inPeriodImport;
                const reductionQty = report.inPeriodExport;
                const endingQty = report.totalImport - report.totalExport;
                const beginningMoney = report.beforePeriodImportMoney - report.beforePeriodExportMoney;
                const increaseMoney = report.inPeriodImportMoney;
                const reductionMoney = report.inPeriodExportMoney;
                const endingMoney = report.totalImportMoney - report.totalExportMoney;
                return {
                    product: report.product,
                    warehouse: report.warehouse,
                    beginning: beginningQty,
                    increase: increaseQty,
                    reduction: reductionQty,
                    ending: endingQty,
                    beginning_money: Math.round(beginningMoney),
                    increase_money: Math.round(increaseMoney),
                    reduction_money: Math.round(reductionMoney),
                    ending_money: Math.round(endingMoney),
                };
            });
            return {
                data: reports,
                summary: {
                    // Quantity summary
                    beginning: reports.reduce((sum, r) => sum + r.beginning, 0),
                    increase: reports.reduce((sum, r) => sum + r.increase, 0),
                    reduction: reports.reduce((sum, r) => sum + r.reduction, 0),
                    ending: reports.reduce((sum, r) => sum + r.ending, 0),
                    // ✅ Money summary
                    beginning_money: reports.reduce((sum, r) => sum + r.beginning_money, 0),
                    increase_money: reports.reduce((sum, r) => sum + r.increase_money, 0),
                    reduction_money: reports.reduce((sum, r) => sum + r.reduction_money, 0),
                    ending_money: reports.reduce((sum, r) => sum + r.ending_money, 0),
                },
            };
        });
    }
    getInventoryReportDetail(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startAt, endAt, warehouseIds, productIds } = query;
            const baseWhere = Object.assign(Object.assign({}, (productIds && productIds.length > 0 && { product_id: { in: productIds } })), (warehouseIds && { warehouse_id: { in: warehouseIds } }));
            const transactions = yield this.db.transactionWarehouses.findMany({
                where: Object.assign(Object.assign({}, baseWhere), { time_at: { lte: endAt } }),
                select: {
                    id: true,
                    product_id: true,
                    warehouse_id: true,
                    type: true,
                    // real_quantity: true,
                    convert_quantity: true,
                    time_at: true,
                    note: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            unit: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    warehouse: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    inventory: {
                        select: {
                            id: true,
                            type: true,
                            files: true,
                        },
                    },
                },
                orderBy: { time_at: 'asc' },
            });
            if (transactions.length === 0) {
                return {
                    product: null,
                    warehouse: null,
                    beginning: 0,
                    increase: 0,
                    reduction: 0,
                    ending: 0,
                    details: [],
                };
            }
            const firstTransaction = transactions[0];
            const product = firstTransaction.product;
            const warehouse = firstTransaction.warehouse;
            let runningBalance = 0;
            let beforePeriodImport = 0;
            let beforePeriodExport = 0;
            let inPeriodImport = 0;
            let inPeriodExport = 0;
            let totalImport = 0;
            let totalExport = 0;
            const details = [];
            transactions.forEach((transaction) => {
                var _a, _b;
                const quantity = transaction.convert_quantity || 0;
                const startDate = startAt ? new Date(startAt) : undefined;
                const endDate = endAt ? new Date(endAt) : undefined;
                const isInPeriod = startDate && endDate ? transaction.time_at >= startDate && transaction.time_at <= endDate : false;
                const isBeforePeriod = startDate ? transaction.time_at < startDate : false;
                // Tính tồn kho tích lũy
                if (transaction.type === 'in') {
                    runningBalance += quantity;
                    totalImport += quantity;
                    if (isInPeriod)
                        inPeriodImport += quantity;
                    if (isBeforePeriod)
                        beforePeriodImport += quantity;
                }
                else if (transaction.type === 'out') {
                    runningBalance -= quantity;
                    totalExport += quantity;
                    if (isInPeriod)
                        inPeriodExport += quantity;
                    if (isBeforePeriod)
                        beforePeriodExport += quantity;
                }
                // Tạo detail item
                const detailItem = {
                    id: transaction.id,
                    time_at: transaction.time_at,
                    type: ((_a = transaction.inventory) === null || _a === void 0 ? void 0 : _a.type) || null,
                    files: ((_b = transaction.inventory) === null || _b === void 0 ? void 0 : _b.files) || [],
                    transaction_type: transaction.type,
                    // convert_quantity: quantity,
                    beginning: isBeforePeriod ? (transaction.type === 'in' ? quantity : -quantity) : 0,
                    increase: isInPeriod && transaction.type === 'in' ? quantity : 0,
                    reduction: isInPeriod && transaction.type === 'out' ? quantity : 0,
                    ending: runningBalance,
                };
                details.push(detailItem);
            });
            return {
                product,
                warehouse,
                beginning: beforePeriodImport - beforePeriodExport,
                increase: inPeriodImport,
                reduction: inPeriodExport,
                ending: totalImport - totalExport,
                details,
            };
        });
    }
    getInventoryImportDetail(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startAt, endAt, warehouseIds, productIds, keyword } = query;
            // Xây dựng where condition
            let whereCondition = Object.assign({ inventory: Object.assign(Object.assign(Object.assign({}, ((startAt || endAt) && {
                    time_at: Object.assign(Object.assign({}, (startAt && { gte: startAt })), (endAt && { lte: endAt })),
                })), { status: app_constant_1.CommonApproveStatus.CONFIRMED }), (warehouseIds &&
                    warehouseIds.length > 0 && {
                    warehouse_id: { in: warehouseIds },
                })) }, (productIds &&
                productIds.length > 0 && {
                order_detail: {
                    product_id: { in: productIds },
                },
            })); // Bổ sung search by keyword
            if (keyword && keyword.trim()) {
                const keywordTrim = keyword.trim();
                const baseInventoryCondition = whereCondition.inventory;
                const baseDetailCondition = whereCondition.order_detail || {};
                whereCondition = {
                    AND: [
                        // Áp dụng các filter cơ bản (time, status, warehouse, product)
                        whereCondition,
                        // Thêm điều kiện search
                        {
                            OR: [
                                Object.assign({ inventory: Object.assign(Object.assign({}, baseInventoryCondition), { code: {
                                            contains: keywordTrim,
                                            mode: 'insensitive',
                                        } }) }, (productIds &&
                                    productIds.length > 0 && {
                                    order_detail: baseDetailCondition,
                                })),
                                // Tìm kiếm theo tên sản phẩm
                                {
                                    inventory: baseInventoryCondition,
                                    order_detail: Object.assign(Object.assign({}, baseDetailCondition), { product: {
                                            name: {
                                                contains: keywordTrim,
                                                mode: 'insensitive',
                                            },
                                        } }),
                                },
                                // Tìm kiếm theo mã sản phẩm
                                {
                                    inventory: baseInventoryCondition,
                                    order_detail: Object.assign(Object.assign({}, baseDetailCondition), { product: {
                                            code: {
                                                contains: keywordTrim,
                                                mode: 'insensitive',
                                            },
                                        } }),
                                },
                            ],
                        },
                    ],
                };
            }
            const data = yield this.db.inventoryDetails.findMany({
                where: whereCondition,
                select: prisma_select_1.InventoryDetailSelectionImportDetail,
            });
            // 1. Lấy mảng unique order IDs từ inventory details
            const orderIds = [
                ...new Set(data.map((item) => { var _a; return (_a = item.inventory) === null || _a === void 0 ? void 0 : _a.order_id; }).filter((orderId) => orderId != null)),
            ];
            const invoices = orderIds.length > 0 ? yield this.db.invoices.findMany({ where: { order_id: { in: orderIds } } }) : [];
            const invoiceMap = new Map();
            invoices.forEach((invoice) => {
                if (invoice.order_id) {
                    invoiceMap.set(invoice.order_id, invoice);
                }
            });
            let result = data.map((item) => {
                var _a;
                const orderId = (_a = item.inventory) === null || _a === void 0 ? void 0 : _a.order_id;
                const invoice = orderId ? invoiceMap.get(orderId) : null;
                return Object.assign(Object.assign({}, item), { invoice: invoice || null });
            });
            result = result.map((item) => {
                var _a, _b;
                const { real_quantity, order_detail } = item;
                const price = Number((_a = order_detail === null || order_detail === void 0 ? void 0 : order_detail.price) !== null && _a !== void 0 ? _a : 0);
                const real_money = (real_quantity !== null && real_quantity !== void 0 ? real_quantity : 0) * price;
                const money = Number((_b = order_detail === null || order_detail === void 0 ? void 0 : order_detail.quantity) !== null && _b !== void 0 ? _b : 0) * price;
                return Object.assign(Object.assign({}, item), { real_money,
                    money });
            });
            // sort by time_at
            result.sort((a, b) => {
                var _a, _b;
                const timeA = new Date(((_a = a.inventory) === null || _a === void 0 ? void 0 : _a.time_at) || 0).getTime();
                const timeB = new Date(((_b = b.inventory) === null || _b === void 0 ? void 0 : _b.time_at) || 0).getTime();
                return timeB - timeA;
            });
            return (0, transform_util_1.transformDecimal)(result);
        });
    }
    getDifferentInventory(data) {
        return data
            .map((item) => {
            var _a;
            let total_different_quantity = 0;
            let total_different_money = 0;
            const { details } = item, rest = __rest(item, ["details"]);
            const newDetails = (_a = details === null || details === void 0 ? void 0 : details.map((detail) => {
                var _a;
                if (!detail)
                    return detail;
                const { quantity = 0, real_quantity = 0, order_detail } = detail, restDetail = __rest(detail, ["quantity", "real_quantity", "order_detail"]);
                const price = (_a = order_detail === null || order_detail === void 0 ? void 0 : order_detail.price) !== null && _a !== void 0 ? _a : 0;
                const diffQty = real_quantity - quantity;
                const diffMoney = real_quantity * price - quantity * price;
                total_different_quantity += diffQty;
                total_different_money += diffMoney;
                return Object.assign(Object.assign({}, restDetail), { quantity,
                    real_quantity,
                    order_detail, different_quantity: diffQty, different_money: diffMoney });
            })) !== null && _a !== void 0 ? _a : [];
            if (total_different_quantity !== 0 && total_different_money != 0) {
                return Object.assign(Object.assign({}, rest), { details: newDetails, total_different_quantity,
                    total_different_money });
            }
            return undefined;
        })
            .filter((item) => item !== undefined);
    }
    different(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { supplierIds, page, size, keyword, startAt, endAt } = query, restQuery = __rest(query, ["supplierIds", "page", "size", "keyword", "startAt", "endAt"]);
            const timeAtFilter = {};
            if (startAt)
                timeAtFilter.gte = time_adapter_1.TimeAdapter.parseStartOfDayDate(startAt).toISOString();
            if (endAt)
                timeAtFilter.lte = time_adapter_1.TimeAdapter.parseEndOfDayDate(endAt).toISOString();
            const where = Object.assign(Object.assign(Object.assign({}, restQuery), (Object.keys(timeAtFilter).length > 0 && {
                time_at: timeAtFilter,
            })), ((supplierIds === null || supplierIds === void 0 ? void 0 : supplierIds.length) > 0 && {
                order: {
                    partner_id: { in: supplierIds },
                },
            }));
            let result = yield this.db.inventories.findMany({
                where,
                select: Object.assign(Object.assign({}, prisma_select_1.InventorySelection), { order: {
                        select: prisma_select_1.OrderSelectionPartner,
                    }, details: {
                        select: prisma_select_1.InventoryDetailSelectionProduct,
                    } }),
            });
            result = this.getDifferentInventory(result);
            const paginated = this.manualPaginate(result, page, size);
            const summary = this.calculateDifferenceSummary(result);
            return Object.assign(Object.assign({}, paginated), { summary });
        });
    }
    calculateDifferenceSummary(data) {
        const total_different_quantity = data.reduce((total, item) => {
            return total + (item.total_different_quantity || 0);
        }, 0);
        const total_different_money = data.reduce((total, item) => {
            return total + (item.total_different_money || 0);
        }, 0);
        return {
            total_different_quantity,
            total_different_money,
        };
    }
    updateRealQuantity(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const inventoryData = yield this.findById(id);
            if (!inventoryData)
                return { id };
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const { files, details } = body;
                // 1. update data
                let dataUpdate = { status: app_constant_1.CommonApproveStatus.CONFIRMED };
                if (files && files.length > 0) {
                    let filesUpdate = (0, handle_files_1.handleFiles)(files, [], (inventoryData === null || inventoryData === void 0 ? void 0 : inventoryData.files) || []);
                    dataUpdate.files = filesUpdate;
                }
                yield this.repo.update({ id }, dataUpdate, tx);
                // 2. update real_quantity, note trong details
                if (!details || details.length === 0)
                    return;
                yield this.validateForeignKeys(details, {
                    id: this.inventoryDetailRepo,
                }, tx);
                const data = details.map((item) => {
                    const { key } = item, rest = __rest(item, ["key"]);
                    return rest;
                });
                yield this.inventoryDetailRepo.updateMany(data, tx);
                // import inventory
                if (app_constant_1.InventoryTypeIn.includes(inventoryData.type)) {
                    logger_1.default.info(`Approve inventory with real quantity for ID ${id}`);
                    yield this.handleApprove(id, inventoryData, tx);
                }
                // export inventory
                if (app_constant_1.InventoryTypeOut.includes(inventoryData.type)) {
                    logger_1.default.info(`Processing export inventory with FIFO logic for ID ${id}`);
                    yield this.processFIFOExportV2(details, tx);
                    yield this.handleApprove(id, inventoryData, tx);
                }
            }));
            return { id };
        });
    }
    checkProductAndOrderTolerances(orderId, inventoryDetails, tolerance, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            logger_1.default.info(`[Tolerance Check] Starting validation for order ${orderId} with tolerance ${tolerance}%`);
            let totalValueConverted = 0;
            for (const inventoryDetail of inventoryDetails) {
                // const orderDetail = orderDetails.find((od) => od.id === inventoryDetail.order_detail_id);
                if (!inventoryDetail.order_detail) {
                    logger_1.default.warn(`[Tolerance Check] Order detail not found for inventory detail: ${inventoryDetail.order_detail_id}`);
                    continue;
                }
                // Calculate new import quantity for this product
                const newImportQty = (0, calculate_convert_qty_1.calculateConvertQty)(Object.assign(Object.assign({}, inventoryDetail.order_detail), { quantity: inventoryDetail.quantity || 0 }));
                totalValueConverted += newImportQty;
                logger_1.default.info(`[Tolerance Check] Product ${inventoryDetail.order_detail.product_id}: New import qty = ${newImportQty}`);
                // Get current imported for this specific product
                const confirmedImported = yield this.transactionWarehouseRepo.aggregate({ order_id: orderId, type: 'in', product_id: inventoryDetail.order_detail.product_id }, { _sum: { convert_quantity: true } }, tx);
                // Get pending inventory quantities (not yet confirmed/approved)
                const pendingInventories = yield this.inventoryDetailRepo.findMany({
                    order_detail_id: inventoryDetail.order_detail_id,
                    inventory: {
                        status: app_constant_1.CommonApproveStatus.PENDING,
                    },
                }, false, tx);
                // Calculate pending quantity
                const pendingQty = pendingInventories.reduce((sum, item) => {
                    const convertedQty = (0, calculate_convert_qty_1.calculateConvertQty)(Object.assign(Object.assign({}, inventoryDetail.order_detail), { quantity: item.quantity || 0 }));
                    return sum + convertedQty;
                }, 0);
                // Check individual product tolerance
                const orderQuantity = (0, calculate_convert_qty_1.calculateConvertQty)(inventoryDetail.order_detail);
                const confirmedQty = ((_a = confirmedImported === null || confirmedImported === void 0 ? void 0 : confirmedImported._sum) === null || _a === void 0 ? void 0 : _a.convert_quantity) || 0;
                const totalPendingAndNew = pendingQty + newImportQty;
                // const totalImported = confirmedQty + newImportQty;
                const totalAllQuantities = confirmedQty + totalPendingAndNew;
                const productProgress = orderQuantity > 0 ? (totalAllQuantities / orderQuantity) * 100 : 0;
                logger_1.default.info(`[Tolerance Check] Product ${inventoryDetail.order_detail.product_id}:`, {
                    orderQuantity,
                    confirmedQty,
                    newImportQty,
                    totalAllQuantities,
                    productProgress: `${productProgress.toFixed(2)}%`,
                    toleranceLimit: `${100 + tolerance}%`,
                    isExceeded: productProgress > 100 + tolerance,
                });
                if (productProgress > 100 + tolerance) {
                    logger_1.default.error(`[Tolerance Check] Product ${inventoryDetail.order_detail.product_id} exceeds tolerance: ${productProgress.toFixed(2)}% > ${100 + tolerance}%`);
                    throw new api_error_1.APIError({
                        message: `Product exceeds tolerance: ${productProgress.toFixed(2)}% > ${100 + tolerance}%`,
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: [`quantity.exceeded.${inventoryDetail === null || inventoryDetail === void 0 ? void 0 : inventoryDetail.key}`],
                    });
                }
            }
            logger_1.default.info(`[Tolerance Check] Total value converted: ${totalValueConverted}`);
            // Check overall order tolerance
            // Check overall order tolerance including pending inventories
            const totalPendingForOrder = yield this.calculateTotalPendingQuantity(orderId, tx);
            const orderProgress = yield this.calculateDeliveryProgressWithPending(orderId, tx, totalValueConverted, totalPendingForOrder);
            logger_1.default.info(` Order validation:`, {
                totalConverted: totalValueConverted,
                totalPending: totalPendingForOrder,
                orderProgress: `${orderProgress.toFixed(2)}%`,
                toleranceLimit: `${100 + tolerance}%`,
                isExceeded: orderProgress > 100 + tolerance,
            });
            if (orderProgress > 100 + tolerance) {
                logger_1.default.error(`[Tolerance Check] Order ${orderId} exceeds tolerance: ${orderProgress.toFixed(2)}% > ${100 + tolerance}%`);
                throw new api_error_1.APIError({
                    message: `Order exceeds tolerance: ${orderProgress.toFixed(2)}% > ${100 + tolerance}%`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`quantity.exceeded`],
                });
            }
            logger_1.default.info(`[Tolerance Check] ✅ Order ${orderId} passed all tolerance checks`);
        });
    }
    calculateTotalPendingQuantity(orderId, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get all pending inventory details for this order
            const pendingInventories = yield this.inventoryDetailRepo.findMany({
                inventory: {
                    order_id: orderId,
                    status: app_constant_1.CommonApproveStatus.PENDING,
                },
            }, true, tx);
            let totalPending = 0;
            for (const item of pendingInventories) {
                if (item === null || item === void 0 ? void 0 : item.order_detail) {
                    const convertedQty = (0, calculate_convert_qty_1.calculateConvertQty)(Object.assign(Object.assign({}, item === null || item === void 0 ? void 0 : item.order_detail), { quantity: item.quantity || 0 }));
                    totalPending += convertedQty;
                }
            }
            return totalPending;
        });
    }
    calculateDeliveryProgressWithPending(orderId_1, tx_1) {
        return __awaiter(this, arguments, void 0, function* (orderId, tx, newQty = 0, pendingQty = 0) {
            var _a;
            const orderDetails = yield this.orderDetailRepo.findMany({ order_id: orderId }, true, tx);
            let initQty = 0;
            if (orderDetails && orderDetails.length > 0) {
                initQty = orderDetails.reduce((total, detail) => {
                    const convertedQuantity = (0, calculate_convert_qty_1.calculateConvertQty)(detail);
                    return total + convertedQuantity;
                }, 0);
            }
            // Get confirmed imported quantity
            const confirmedImported = yield this.transactionWarehouseRepo.aggregate({ order_id: orderId, type: 'in' }, {
                _sum: {
                    convert_quantity: true,
                },
            }, tx);
            const confirmedQty = ((_a = confirmedImported === null || confirmedImported === void 0 ? void 0 : confirmedImported._sum) === null || _a === void 0 ? void 0 : _a.convert_quantity) || 0;
            const totalWithPendingAndNew = confirmedQty + pendingQty + newQty;
            const percent = initQty > 0 ? (totalWithPendingAndNew / initQty) * 100 : 0;
            return percent;
        });
    }
    approveExportInventory(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const inventoryData = yield this.validateStatusApprove(id);
            try {
                yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // 1. Cập nhật status của inventory
                    yield this.repo.update({ id }, body, tx); // 2. Lấy chi tiết phiếu xuất
                    const inventoryDetails = yield tx.inventoryDetails.findMany({
                        where: { inventory_id: id },
                        select: prisma_select_1.InventoryDetailSelectionProduct,
                    });
                    // 3. Sử dụng batch processing để xử lý FIFO cho tất cả sản phẩm
                    yield this.batchProcessFIFOExport(id, inventoryDetails, inventoryData, tx);
                    // 4. Cập nhật delivery progress cho order nếu có
                    if (inventoryData.order_id) {
                        yield this.updateOrderProgressAfterExport(inventoryData.order_id, tx);
                    }
                }));
                return { id };
            }
            catch (error) {
                throw error;
            }
        });
    } /**
     * Xử lý FIFO export - nhập trước xuất trước
     */
    processFIFOExport(productId, exportQuantity, warehouseId, inventoryDetail, inventoryData, inventoryId, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            logger_1.default.info(`[FIFO Export] Processing export for product ${productId}, quantity: ${exportQuantity}`);
            // 1. Lấy tổng số lượng tồn kho hiện tại
            const currentStock = yield this.getCurrentStock(productId, warehouseId, tx);
            if (currentStock < exportQuantity) {
                throw new api_error_1.APIError({
                    message: `Không đủ hàng tồn kho. Tồn kho hiện tại: ${currentStock}, yêu cầu xuất: ${exportQuantity}`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: ['inventory.insufficient_stock'],
                });
            }
            // 3. Tạo transaction xuất kho tổng hợp
            const productData = (_a = inventoryDetail.order_detail) === null || _a === void 0 ? void 0 : _a.product;
            const exportTransaction = Object.assign(Object.assign({ real_quantity: exportQuantity, convert_quantity: exportQuantity, quantity: inventoryDetail.quantity || exportQuantity, inventory: { connect: { id: inventoryId } }, inventory_detail: { connect: { id: inventoryDetail.id } }, warehouse: { connect: { id: warehouseId } }, order: { connect: { id: inventoryData.order_id } }, product: { connect: { id: productId } } }, ((productData === null || productData === void 0 ? void 0 : productData.parent_id) && { child: { connect: { id: productData.id } } })), { type: 'out', time_at: inventoryData.time_at, note: `FIFO export` });
            yield this.transactionWarehouseRepo.create(exportTransaction, tx);
            // 4. Cập nhật import quantity trong order details
            yield this.commonDetailService.updateImportQuantity({ id: inventoryDetail.order_detail_id }, { type: 'decrease', quantity: inventoryDetail.quantity || exportQuantity }, tx);
            logger_1.default.info(`[FIFO Export] Successfully exported ${exportQuantity} for product ${productId}`);
        });
    }
    /**
     * Lấy số lượng tồn kho hiện tại
     */
    getCurrentStock(productId, warehouseId, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const stockData = yield tx.transactionWarehouses.aggregate({
                where: {
                    product_id: productId,
                    warehouse_id: warehouseId,
                    inventory: {
                        status: app_constant_1.CommonApproveStatus.CONFIRMED,
                    },
                },
                _sum: {
                    convert_quantity: true,
                },
            });
            return stockData._sum.convert_quantity || 0;
        });
    }
    /**
     * Cập nhật delivery progress sau khi xuất kho
     */
    updateOrderProgressAfterExport(orderId, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const orderDetails = yield tx.commonDetails.findMany({
                where: { order_id: orderId },
                select: prisma_select_1.CommonDetailSelectionAll,
            });
            let initQty = 0;
            if (orderDetails && orderDetails.length > 0) {
                initQty = orderDetails.reduce((total, detail) => {
                    const convertedQuantity = (0, calculate_convert_qty_1.calculateConvertQty)(detail);
                    return total + convertedQuantity;
                }, 0);
            }
            const importQty = yield this.transactionWarehouseRepo.aggregate({ order_id: orderId, type: 'in' }, { _sum: { convert_quantity: true } }, tx);
            const exportQty = yield this.transactionWarehouseRepo.aggregate({ order_id: orderId, type: 'out' }, { _sum: { convert_quantity: true } }, tx);
            const netImportQty = (((_a = importQty === null || importQty === void 0 ? void 0 : importQty._sum) === null || _a === void 0 ? void 0 : _a.convert_quantity) || 0) - (((_b = exportQty === null || exportQty === void 0 ? void 0 : exportQty._sum) === null || _b === void 0 ? void 0 : _b.convert_quantity) || 0);
            const percent = initQty > 0 ? (netImportQty / initQty) * 100 : 0;
            const orderData = yield this.orderRepo.findOne({ id: orderId }, false, tx);
            const isDone = percent >= 100 - ((orderData === null || orderData === void 0 ? void 0 : orderData.tolerance) || 0);
            yield this.orderRepo.update({ id: orderId }, { delivery_progress: Math.max(0, percent), isDone }, tx);
        });
    }
    /**
     * Kiểm tra tồn kho có đủ để xuất không
     */
    checkStockAvailability(checks, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const database = tx || this.db;
            const details = [];
            let isAvailable = true;
            for (const check of checks) {
                const currentStock = yield this.getCurrentStock(check.productId, check.warehouseId, database);
                const shortage = Math.max(0, check.requiredQuantity - currentStock);
                if (shortage > 0) {
                    isAvailable = false;
                }
                details.push({
                    productId: check.productId,
                    warehouseId: check.warehouseId,
                    currentStock,
                    requiredQuantity: check.requiredQuantity,
                    shortage,
                });
            }
            return {
                isAvailable,
                details,
            };
        });
    }
    /**
     * Tối ưu hóa: Batch processing cho nhiều sản phẩm xuất cùng lúc
     */
    batchProcessFIFOExport(inventoryId, inventoryDetails, inventoryData, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            // 1. Kiểm tra tồn kho trước khi thực hiện xuất
            const stockChecks = inventoryDetails
                .map((detail) => {
                var _a, _b, _c, _d;
                return ({
                    productId: ((_b = (_a = detail.order_detail) === null || _a === void 0 ? void 0 : _a.product) === null || _b === void 0 ? void 0 : _b.parent_id) || ((_d = (_c = detail.order_detail) === null || _c === void 0 ? void 0 : _c.product) === null || _d === void 0 ? void 0 : _d.id),
                    warehouseId: inventoryData.warehouse_id,
                    requiredQuantity: detail.real_quantity || detail.quantity || 0,
                });
            })
                .filter((check) => check.productId && check.requiredQuantity > 0);
            const stockAvailability = yield this.checkStockAvailability(stockChecks, tx);
            if (!stockAvailability.isAvailable) {
                const shortageDetails = stockAvailability.details
                    .filter((d) => d.shortage > 0)
                    .map((d) => `Product ${d.productId}: thiếu ${d.shortage}`)
                    .join(', ');
                throw new api_error_1.APIError({
                    message: `Không đủ hàng tồn kho: ${shortageDetails}`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: ['inventory.insufficient_stock'],
                });
            }
            // 2. Thực hiện xuất kho cho từng sản phẩm
            for (const detail of inventoryDetails) {
                if (!detail.order_detail_id || !detail.order_detail)
                    continue;
                const exportQuantity = detail.real_quantity || detail.quantity || 0;
                const productId = ((_b = (_a = detail.order_detail) === null || _a === void 0 ? void 0 : _a.product) === null || _b === void 0 ? void 0 : _b.parent_id) || ((_d = (_c = detail.order_detail) === null || _c === void 0 ? void 0 : _c.product) === null || _d === void 0 ? void 0 : _d.id);
                if (exportQuantity > 0 && productId) {
                    yield this.processFIFOExport(productId, exportQuantity, inventoryData.warehouse_id, detail, inventoryData, inventoryId, tx);
                }
            }
        });
    }
    /**
     * Validate stock availability for export inventory
     * Kiểm tra tồn kho cho phiếu xuất kho
     */
    validateStockForExport(details, warehouseId, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            logger_1.default.info(`[Stock Validation] Checking stock for export at warehouse ${warehouseId}`);
            const stockCheckErrors = [];
            for (const detail of details) {
                if (!detail.order_detail_id)
                    continue;
                // Lấy thông tin order detail để biết product_id
                const orderDetail = yield this.orderDetailRepo.findOne({ id: detail.order_detail_id }, true, tx);
                if (!orderDetail) {
                    logger_1.default.warn(`[Stock Validation] Order detail not found: ${detail.order_detail_id}`);
                    continue;
                }
                const productData = orderDetail === null || orderDetail === void 0 ? void 0 : orderDetail.product;
                if (!productData) {
                    logger_1.default.warn(`[Stock Validation] Product not found for order detail: ${detail.order_detail_id}`);
                    continue;
                }
                // Lấy product_id (ưu tiên parent_id nếu có)
                const productId = productData.parent_id || productData.id;
                // Số lượng xuất yêu cầu
                const exportQuantity = detail.real_quantity || detail.quantity || 0;
                if (exportQuantity <= 0)
                    continue;
                // Lấy tồn kho hiện tại
                const currentStock = yield this.getCurrentStock(productId, warehouseId, tx);
                logger_1.default.info(`[Stock Validation] Product ${productId} (${productData.name}):`, {
                    currentStock,
                    exportQuantity,
                    isAvailable: currentStock >= exportQuantity,
                });
                // Kiểm tra đủ tồn kho không
                if (currentStock < exportQuantity) {
                    const shortage = exportQuantity - currentStock;
                    const productName = productData.name || `Product ${productId}`;
                    const unitName = ((_a = productData.unit) === null || _a === void 0 ? void 0 : _a.name) || 'đơn vị';
                    stockCheckErrors.push(`${productName}: Thiếu ${shortage} ${unitName} (Tồn kho: ${currentStock}, Yêu cầu: ${exportQuantity})`);
                    logger_1.default.error(`[Stock Validation] Insufficient stock for product ${productId}:`, {
                        productName,
                        currentStock,
                        exportQuantity,
                        shortage,
                    });
                }
            }
            // Nếu có lỗi tồn kho thì throw error
            if (stockCheckErrors.length > 0) {
                const errorMessage = `Không đủ hàng tồn kho để xuất:\n${stockCheckErrors.join('\n')}`;
                logger_1.default.error(`[Stock Validation] Export validation failed:`, {
                    warehouseId,
                    errors: stockCheckErrors,
                });
                throw new api_error_1.APIError({
                    message: errorMessage,
                    status: errors_1.StatusCode.BAD_REQUEST,
                    errors: [`inventory.${errors_1.ErrorKey.INVALID}`],
                });
            }
            logger_1.default.info(`[Stock Validation] ✅ All products have sufficient stock for export`);
        });
    }
    updateAdjustQuantity(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const inventoryData = yield this.findById(id);
            if (!inventoryData)
                return { id };
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const { details } = body;
                if ((details === null || details === void 0 ? void 0 : details.length) > 0) {
                    yield this.validateForeignKeys(details, {
                        id: this.inventoryDetailRepo,
                    }, tx);
                    const data = details.map((item) => {
                        const { key } = item, rest = __rest(item, ["key"]);
                        return rest;
                    });
                    yield this.inventoryDetailRepo.updateMany(data, tx);
                }
            }));
            return { id };
        });
    }
}
exports.InventoryService = InventoryService;
