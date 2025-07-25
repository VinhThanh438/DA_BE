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
exports.OrderService = void 0;
const base_service_1 = require("./master/base.service");
const common_detail_repo_1 = require("../repositories/common-detail.repo");
const order_repo_1 = require("../repositories/order.repo");
const employee_repo_1 = require("../repositories/employee.repo");
const partner_repo_1 = require("../repositories/partner.repo");
const product_repo_1 = require("../repositories/product.repo");
const app_constant_1 = require("../../config/app.constant");
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const representative_repo_1 = require("../repositories/representative.repo");
const bank_repo_1 = require("../repositories/bank.repo");
const unit_repo_1 = require("../repositories/unit.repo");
const transaction_repo_1 = require("../repositories/transaction.repo");
const handle_files_1 = require("../helpers/handle-files");
const shipping_plan_repo_1 = require("../repositories/shipping-plan.repo");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const calculate_convert_qty_1 = require("../helpers/calculate-convert-qty");
const unloading_cost_repo_1 = require("../repositories/unloading-cost.repo");
const common_service_1 = require("./common.service");
const event_constant_1 = require("../../config/event.constant");
const eventbus_1 = __importDefault(require("../eventbus"));
const transaction_warehouse_service_1 = require("./transaction-warehouse.service");
class OrderService extends base_service_1.BaseService {
    constructor() {
        super(new order_repo_1.OrderRepo());
        this.orderDetailRepo = new common_detail_repo_1.CommonDetailRepo();
        this.partnerRepo = new partner_repo_1.PartnerRepo();
        this.employeeRepo = new employee_repo_1.EmployeeRepo();
        this.productRepo = new product_repo_1.ProductRepo();
        this.bankRepo = new bank_repo_1.BankRepo();
        this.unitRepo = new unit_repo_1.UnitRepo();
        this.representativeRepo = new representative_repo_1.RepresentativeRepo();
        this.transactionRepo = new transaction_repo_1.TransactionRepo();
        this.shippingPlanRepo = new shipping_plan_repo_1.ShippingPlanRepo();
        this.unloadingCostRepo = new unloading_cost_repo_1.UnloadingCostRepo();
        this.transWhService = transaction_warehouse_service_1.TransactionWarehouseService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new OrderService();
        }
        return this.instance;
    }
    enrichOrderTotals(responseData) {
        return __awaiter(this, void 0, void 0, function* () {
            const enrichedData = yield Promise.all(responseData.data.map((order) => __awaiter(this, void 0, void 0, function* () {
                let total_money = 0;
                let total_vat = 0;
                let total_commission = 0;
                for (const detail of order.details) {
                    const orderDetail = yield this.orderDetailRepo.findOne({ id: detail.order_detail_id });
                    if (!orderDetail)
                        continue;
                    const quantity = Number(orderDetail.imported_quantity || 0);
                    const price = Number(orderDetail.price || 0);
                    const vat = Number(orderDetail.vat || 0);
                    const commission = Number(orderDetail.commission || 0);
                    const totalMoney = quantity * price;
                    const totalVat = (totalMoney * vat) / 100;
                    const totalCommission = (totalMoney * commission) / 100;
                    total_money += totalMoney;
                    total_vat += totalVat;
                    total_commission += totalCommission;
                }
                const total_amount = total_money + total_vat;
                return Object.assign(Object.assign({}, order), { total_money,
                    total_vat,
                    total_amount,
                    total_commission });
            })));
            return Object.assign(Object.assign({}, responseData), { data: enrichedData });
        });
    }
    attachPaymentInfoToOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const transactionData = yield this.transactionRepo.findMany({
                order_id: order.id,
            });
            const totalPaid = transactionData
                .filter((t) => t.type === 'out')
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const totalCommissionPaid = transactionData
                .filter((t) => { var _a; return (_a = t.note) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('hoa hồng'); })
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const totalOrderAmount = ((_a = order.details) !== null && _a !== void 0 ? _a : []).reduce((sum, detail) => {
                const detailTotal = detail.quantity * detail.price;
                const detailVat = (detailTotal * (detail.vat || 0)) / 100;
                return sum + detailTotal + detailVat;
            }, 0);
            const detailsWithPayments = yield Promise.all(((_b = order.details) !== null && _b !== void 0 ? _b : []).map((detail) => __awaiter(this, void 0, void 0, function* () {
                const quantity = detail.quantity;
                const price = detail.price;
                const vatPercent = detail.vat || 0;
                const commission = detail.commission || 0;
                const detailTotal = quantity * price;
                const detailVat = (detailTotal * vatPercent) / 100;
                const detailTotalAfterVat = detailTotal + detailVat;
                const ratio = totalOrderAmount ? detailTotalAfterVat / totalOrderAmount : 0;
                const amount_paid = ratio * totalPaid;
                const amount_debt = detailTotalAfterVat - amount_paid;
                const commission_paid = ratio * totalCommissionPaid;
                const commission_debt = commission - commission_paid;
                // Await the async method call
                const progress = order.type === app_constant_1.OrderType.PURCHASE
                    ? yield this.getOrderDetailPurchaseProcessing(Object.assign(Object.assign({}, detail), { order_id: order.id }))
                    : yield this.getOrderDetailExportProcessing(Object.assign(Object.assign({}, detail), { order_id: order.id }));
                return Object.assign(Object.assign({}, detail), { amount_paid,
                    amount_debt,
                    commission_paid,
                    commission_debt,
                    progress, product: common_service_1.CommonService.transformProductDataStock(detail.product) });
            })));
            return Object.assign(Object.assign({}, order), { details: detailsWithPayments });
        });
    }
    checkIsDone(progress, tolerance) {
        if (progress >= 100 - tolerance) {
            return true;
        }
        return false;
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            // delete query.isDone;
            if (query.types && Array.isArray(query.types) && query.types.length > 0) {
                query.type = { in: query.types };
                delete query.types;
            }
            const data = yield this.repo.paginate(query, true);
            data.data = yield Promise.all(data.data.map((order) => this.attachPaymentInfoToOrder(order)));
            // Calculate totals for each order and overall summary
            let summary_total_money = 0;
            let summary_total_vat = 0;
            let summary_total_commission = 0;
            const enrichedData = yield Promise.all(data.data.map((order) => __awaiter(this, void 0, void 0, function* () {
                let total_money = 0;
                let total_vat = 0;
                let total_commission = 0;
                for (const detail of order.details || []) {
                    const quantity = Number(detail.quantity || 0);
                    const price = Number(detail.price || 0);
                    const vat = Number(detail.vat || 0);
                    const commission = Number(detail.commission || 0);
                    const detailTotal = quantity * price;
                    const detailVat = (detailTotal * vat) / 100;
                    const detailCommission = (detailTotal * commission) / 100;
                    total_money += detailTotal;
                    total_vat += detailVat;
                    total_commission += detailCommission;
                }
                const total_amount = total_money + total_vat;
                // Add to summary totals
                summary_total_money += total_money;
                summary_total_vat += total_vat;
                summary_total_commission += total_commission;
                return Object.assign(Object.assign({}, order), { 
                    // details: order.details.map((detail: any) => ({
                    //     ...detail,
                    //     product: CommonService.transformProductDataStock(detail.product || {}),
                    // })),
                    total_money: parseFloat(total_money.toFixed(2)), total_vat: parseFloat(total_vat.toFixed(2)), total_amount: parseFloat(total_amount.toFixed(2)), total_commission: parseFloat(total_commission.toFixed(2)) });
            })));
            const summary_total_amount = summary_total_money + summary_total_vat;
            return Object.assign(Object.assign({}, data), { data: enrichedData, summary: {
                    total_money: parseFloat(summary_total_money.toFixed(2)),
                    total_vat: parseFloat(summary_total_vat.toFixed(2)),
                    total_amount: parseFloat(summary_total_amount.toFixed(2)),
                    total_commission: parseFloat(summary_total_commission.toFixed(2)),
                } });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.repo.findOne({ id }, true));
            if (!data) {
                throw new api_error_1.APIError({
                    message: 'common.not-found',
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`id.${errors_1.ErrorKey.NOT_FOUND}`],
                });
            }
            return this.attachPaymentInfoToOrder(data);
        });
    }
    create(request) {
        return __awaiter(this, void 0, void 0, function* () {
            let orderId = 0;
            yield this.isExist({ code: request.code });
            yield this.validateForeignKeys(request, {
                partner_id: this.partnerRepo,
                employee_id: this.employeeRepo,
                representative_id: this.representativeRepo,
                bank_id: this.bankRepo,
            });
            const { shipping_plans, details, unloading_costs } = request, orderData = __rest(request, ["shipping_plans", "details", "unloading_costs"]);
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const { partner_id, employee_id, bank_id, representative_id } = orderData, restData = __rest(orderData, ["partner_id", "employee_id", "bank_id", "representative_id"]);
                Object.assign(restData, {
                    partner: partner_id ? { connect: { id: partner_id } } : undefined,
                    employee: employee_id ? { connect: { id: employee_id } } : undefined,
                    representative: representative_id ? { connect: { id: representative_id } } : undefined,
                    bank: bank_id ? { connect: { id: bank_id } } : undefined,
                });
                orderId = yield this.repo.create(restData, tx);
                if (details && details.length > 0) {
                    yield this.validateForeignKeys(details, {
                        product_id: this.productRepo,
                        unit_id: this.unitRepo,
                    }, tx);
                    const mappedData = this.autoMapConnection(details, {
                        order_id: orderId,
                    });
                    const filteredData = this.filterData(mappedData, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['details']);
                    yield this.orderDetailRepo.createMany(filteredData, tx);
                }
                else {
                    throw new api_error_1.APIError({
                        message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: [`details.${errors_1.ErrorKey.INVALID}`],
                    });
                }
                if (shipping_plans && shipping_plans.length > 0) {
                    yield this.validateForeignKeys(shipping_plans, {
                        partner_id: this.partnerRepo,
                    }, tx);
                    const data = shipping_plans.map((item) => {
                        const { key } = item, rest = __rest(item, ["key"]);
                        return Object.assign(Object.assign({}, rest), { order_id: orderId, organization_id: request.organization_id });
                    });
                    yield this.shippingPlanRepo.createMany(data, tx);
                }
                if (unloading_costs && unloading_costs.length > 0) {
                    yield this.validateForeignKeys(unloading_costs, {
                        unit_id: this.unitRepo,
                    }, tx);
                    const data = unloading_costs.map((item) => {
                        const { key } = item, rest = __rest(item, ["key"]);
                        return Object.assign(Object.assign({}, rest), { order_id: orderId, organization_id: request.organization_id });
                    });
                    yield this.unloadingCostRepo.createMany(data);
                }
            }));
            return { id: orderId };
        });
    }
    updateOrder(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { details, add, update, delete: deleteIds, contracts, invoices, productions, inventories, files_add, files_delete, files, shipping_plans_add, shipping_plans_delete, shipping_plans_update, unloading_costs_add, unloading_costs_update, unloading_costs_delete } = request, orderData = __rest(request, ["details", "add", "update", "delete", "contracts", "invoices", "productions", "inventories", "files_add", "files_delete", "files", "shipping_plans_add", "shipping_plans_delete", "shipping_plans_update", "unloading_costs_add", "unloading_costs_update", "unloading_costs_delete"]);
            try {
                const orderExists = yield this.findById(id);
                if (!orderExists) {
                    return { id };
                }
                // start update
                yield this.validateForeignKeys(request, {
                    partner_id: this.partnerRepo,
                    employee_id: this.employeeRepo,
                    representative_id: this.representativeRepo,
                    bank_id: this.bankRepo,
                });
                // handle files
                let filesUpdate = (0, handle_files_1.handleFiles)(files_add, files_delete, orderExists.files);
                yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    yield this.repo.update({ id }, Object.assign(Object.assign({}, orderData), (filesUpdate !== null && { files: filesUpdate })), tx);
                    // [add] order details
                    if (add && add.length > 0) {
                        yield this.validateForeignKeys(add, {
                            product_id: this.productRepo,
                            unit_id: this.unitRepo,
                        }, tx);
                        const data = add.map((item) => {
                            const { key } = item, rest = __rest(item, ["key"]);
                            return Object.assign(Object.assign({}, rest), { order_id: id });
                        });
                        yield this.orderDetailRepo.createMany(data, tx);
                    }
                    // [update] order details
                    if (update && update.length > 0) {
                        yield this.validateForeignKeys(update, {
                            id: this.orderDetailRepo,
                            product_id: this.productRepo,
                            unit_id: this.unitRepo,
                        }, tx);
                        const data = update.map((item) => {
                            const { key } = item, rest = __rest(item, ["key"]);
                            return rest;
                        });
                        yield this.orderDetailRepo.updateMany(data, tx);
                    }
                    // [delete] order details
                    if (deleteIds && deleteIds.length > 0) {
                        yield this.orderDetailRepo.deleteMany({ id: { in: deleteIds } }, tx, false);
                    }
                    // [add] shippings
                    if (shipping_plans_add && shipping_plans_add.length > 0) {
                        yield this.validateForeignKeys(shipping_plans_add, { partner_id: this.partnerRepo }, tx);
                        const data = shipping_plans_add.map((item) => {
                            const { key } = item, rest = __rest(item, ["key"]);
                            return Object.assign(Object.assign({}, rest), { order_id: id });
                        });
                        yield this.shippingPlanRepo.createMany(data, tx);
                    }
                    // [update] shippings
                    if (shipping_plans_update && shipping_plans_update.length > 0) {
                        yield this.validateForeignKeys(shipping_plans_update, {
                            partner_id: this.partnerRepo,
                        }, tx);
                        const data = shipping_plans_update.map((item) => {
                            const { key } = item, rest = __rest(item, ["key"]);
                            return rest;
                        });
                        yield this.shippingPlanRepo.updateMany(data, tx);
                    }
                    // [delete] shippings
                    if (shipping_plans_delete && shipping_plans_delete.length > 0) {
                        yield this.shippingPlanRepo.deleteMany({ id: { in: shipping_plans_delete } }, tx, false);
                    }
                    if (unloading_costs_add && unloading_costs_add.length > 0) {
                        yield this.validateForeignKeys(unloading_costs_add, { unit_id: this.unitRepo }, tx);
                        const data = unloading_costs_add.map((item) => {
                            const { key } = item, rest = __rest(item, ["key"]);
                            return Object.assign(Object.assign({}, rest), { order_id: id });
                        });
                        yield this.unloadingCostRepo.createMany(data, tx);
                    }
                    if (unloading_costs_update && unloading_costs_update.length > 0) {
                        yield this.validateForeignKeys(unloading_costs_update, {
                            unit_id: this.unitRepo,
                        }, tx);
                        const data = unloading_costs_update.map((item) => {
                            const { key } = item, rest = __rest(item, ["key"]);
                            return rest;
                        });
                        yield this.unloadingCostRepo.updateMany(data, tx);
                    }
                    if (unloading_costs_delete && unloading_costs_delete.length > 0) {
                        yield this.unloadingCostRepo.deleteMany({ id: { in: unloading_costs_delete } }, tx, false);
                    }
                }));
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
    approveShippingPlan(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const shippingPlanData = yield this.validateStatusApprove(id, this.shippingPlanRepo);
            if (body.files && body.files.length > 0) {
                const orderData = yield this.repo.findOne({ id: shippingPlanData === null || shippingPlanData === void 0 ? void 0 : shippingPlanData.order_id });
                if (!orderData) {
                    throw new api_error_1.APIError({
                        message: 'common.not-found',
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: [`order_id.${errors_1.ErrorKey.NOT_FOUND}`],
                    });
                }
                let filesUpdate = (0, handle_files_1.handleFiles)(body.files, [], orderData.files || []);
                yield this.repo.update({ id: orderData.id }, { files: filesUpdate });
            }
            yield this.shippingPlanRepo.update({ id }, body);
            return { id };
        });
    }
    calculateTotalConvertedQuantity(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderDetails = yield this.orderDetailRepo.findMany({ order_id: orderId }, true);
            if (!orderDetails || orderDetails.length === 0)
                return 0;
            return orderDetails.reduce((total, detail) => {
                const convertedQuantity = (0, calculate_convert_qty_1.calculateConvertQty)(detail);
                return total + convertedQuantity;
            }, 0);
        });
    }
    getPurchaseProcessing(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderProducts = yield this.db.commonDetails.findMany({
                where: { order_id: orderId },
                select: { id: true, product_id: true, product: true },
                distinct: ['product_id'],
            });
            const orderProductMap = new Map();
            orderProducts.forEach((item) => {
                if (item.product_id) {
                    orderProductMap.set(item.product_id, item);
                }
            });
            const inventoryTransactions = yield this.db.inventories.findMany({
                where: { order_id: orderId },
                select: {
                    id: true,
                    code: true,
                    time_at: true,
                    order_id: true,
                    details: {
                        select: {
                            quantity: true,
                            // product_id: true,
                            order_detail: {
                                select: {
                                    product_id: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { time_at: 'asc' },
            });
            const allTransactionProductIds = new Set();
            inventoryTransactions.forEach((transaction) => {
                transaction.details.forEach((detail) => {
                    var _a;
                    if ((_a = detail.order_detail) === null || _a === void 0 ? void 0 : _a.product_id) {
                        allTransactionProductIds.add(detail.order_detail.product_id);
                    }
                });
            });
            const validProductIds = Array.from(allTransactionProductIds).filter((productId) => orderProductMap.has(productId));
            const importBatches = inventoryTransactions.map((transaction) => ({
                time_at: (0, moment_timezone_1.default)(transaction.time_at).format('YYYY-MM-DD'),
                code: transaction.code,
                transaction: transaction,
            }));
            const result = validProductIds.map((productId) => {
                const orderProduct = orderProductMap.get(productId);
                const productImports = [];
                let totalQuantity = 0;
                importBatches.forEach((batch) => {
                    const transaction = batch.transaction;
                    const productDetail = transaction.details.find((detail) => detail.product_id === productId);
                    if (productDetail && (productDetail.quantity || 0) > 0) {
                        productImports.push({
                            time_at: batch.time_at,
                            code: batch.code,
                            quantity: productDetail.quantity || 0,
                        });
                        totalQuantity += productDetail.quantity || 0;
                    }
                    else {
                        productImports.push({
                            time_at: batch.time_at,
                            code: null,
                            quantity: 0,
                        });
                    }
                });
                return {
                    product_id: productId,
                    product: orderProduct.product,
                    imports: productImports,
                    total_quantity: totalQuantity,
                };
            });
            return result;
        });
    }
    /**
     * Get purchase processing information for a specific order detail
     * @param orderDetailId ID of the order detail to check
     * @returns Import information for the specific product
     */
    getOrderDetailPurchaseProcessing(orderDetail) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!orderDetail || !((_a = orderDetail.product) === null || _a === void 0 ? void 0 : _a.id) || !orderDetail.order_id) {
                return {};
            }
            const productId = (_b = orderDetail.product) === null || _b === void 0 ? void 0 : _b.id;
            const orderId = orderDetail.order_id;
            // 2. Get inventory transactions related to this order
            const inventoryTransactions = yield this.db.inventories.findMany({
                where: { order_id: orderId },
                select: {
                    id: true,
                    code: true,
                    time_at: true,
                    order_id: true,
                    shipping_plan_id: true,
                    details: {
                        where: {
                            order_detail_id: orderDetail.id,
                        },
                        select: {
                            transaction_warehouses: {
                                select: {
                                    quantity: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { time_at: 'asc' },
            });
            // 3. Format transactions for processing
            const importBatches = inventoryTransactions.map((transaction) => ({
                time_at: (0, moment_timezone_1.default)(transaction.time_at).format('YYYY-MM-DD'),
                code: transaction.code,
                shipping_plan_id: transaction.shipping_plan_id,
                transaction: transaction,
            }));
            // 4. Process imports for this product
            const productImports = [];
            let totalQuantity = 0;
            importBatches.forEach((batch) => {
                var _a;
                const transaction = batch.transaction;
                // With the filtered query, we only need to check if there are any details
                const hasDetails = transaction.details && transaction.details.length > 0;
                if (hasDetails) {
                    // Sum quantities across all matching details (usually just one)
                    const batchQuantity = ((_a = transaction.details) === null || _a === void 0 ? void 0 : _a.reduce((sum, detail) => {
                        var _a;
                        const transactionWarehouses = detail === null || detail === void 0 ? void 0 : detail.transaction_warehouses;
                        const convertQuantity = Array.isArray(transactionWarehouses) && transactionWarehouses.length > 0
                            ? ((_a = transactionWarehouses[0]) === null || _a === void 0 ? void 0 : _a.quantity) || 0
                            : 0;
                        return sum + convertQuantity;
                    }, 0)) || 0;
                    if (batchQuantity > 0) {
                        productImports.push({
                            time_at: batch.time_at,
                            code: batch.code,
                            shipping_plan_id: batch.shipping_plan_id,
                            quantity: batchQuantity,
                        });
                        totalQuantity += batchQuantity;
                    }
                    else {
                        productImports.push({
                            time_at: batch.time_at,
                            code: batch.code,
                            shipping_plan_id: batch.shipping_plan_id,
                            quantity: 0,
                        });
                    }
                }
                else {
                    productImports.push({
                        time_at: batch.time_at,
                        code: null,
                        shipping_plan_id: batch.shipping_plan_id || null,
                        quantity: 0,
                    });
                }
            });
            const exports = yield this.getOrderDetailExports(orderDetail);
            const totalExportQuantity = yield this.calculateOrderDetailExportQuantity(orderDetail.id);
            return {
                product_id: productId,
                product: orderDetail.product,
                imports: productImports,
                total: totalQuantity,
                exports,
                total_export: totalExportQuantity,
            };
        });
    }
    /**
     * Get purchase processing information for a specific order detail
     * @param orderDetailId ID of the order detail to check
     * @returns Import information for the specific product
     */
    getOrderDetailExportProcessing(orderDetail) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!orderDetail || !((_a = orderDetail.product) === null || _a === void 0 ? void 0 : _a.id) || !orderDetail.order_id) {
                return {};
            }
            const productId = (_b = orderDetail.product) === null || _b === void 0 ? void 0 : _b.id;
            const exports = yield this.getOrderDetailExports(orderDetail);
            const totalExportQuantity = yield this.calculateOrderDetailExportQuantity(orderDetail.id);
            return {
                product_id: productId,
                product: orderDetail.product,
                imports: exports,
                total: totalExportQuantity,
            };
        });
    }
    // ✅ Thêm hàm mới để lấy dữ liệu xuất kho
    getOrderDetailExports(orderDetail) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(orderDetail === null || orderDetail === void 0 ? void 0 : orderDetail.id))
                return [];
            // Lấy các transaction xuất kho cho OrderDetail này
            const exportTransactions = yield this.db.transactionWarehouses.findMany({
                where: {
                    inventory_detail: {
                        order_detail_id: orderDetail.id,
                    },
                    type: 'out',
                },
                select: {
                    id: true,
                    quantity: true,
                    time_at: true,
                    inventory: {
                        select: {
                            id: true,
                            code: true,
                        },
                    },
                },
                orderBy: { time_at: 'asc' },
            });
            // Format dữ liệu xuất kho
            return exportTransactions.map((tx) => {
                var _a;
                return ({
                    time_at: (0, moment_timezone_1.default)(tx.time_at).format('YYYY-MM-DD'),
                    code: ((_a = tx.inventory) === null || _a === void 0 ? void 0 : _a.code) || null,
                    quantity: tx.quantity || 0,
                });
            });
        });
    }
    // ✅ Thêm hàm mới để tính tổng số lượng đã xuất kho
    calculateOrderDetailExportQuantity(orderDetailId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!orderDetailId)
                return 0;
            const result = yield this.db.transactionWarehouses.aggregate({
                where: {
                    inventory_detail: {
                        order_detail_id: orderDetailId,
                    },
                    type: 'out',
                },
                _sum: {
                    quantity: true,
                },
            });
            return result._sum.quantity || 0;
        });
    }
    approve(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderData = yield this.validateStatusApprove(id);
            const { files } = body, restData = __rest(body, ["files"]);
            let dataToUpdate = Object.assign({}, restData);
            if (files && files.length > 0) {
                let filesUpdate = (0, handle_files_1.handleFiles)(files, [], orderData.files || []);
                dataToUpdate.files = filesUpdate;
            }
            yield this.repo.update({ id }, dataToUpdate);
            return { id };
        });
    }
    calculateAndUpdateOrderProcessing(orderData, quantity, initQty, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const percent = initQty > 0 ? (quantity / initQty) * 100 : 0;
            const isDone = percent >= 100 - ((orderData === null || orderData === void 0 ? void 0 : orderData.tolerance) || 0);
            yield this.repo.update({ id: orderData.id }, {
                delivery_progress: percent,
                isDone,
            }, tx);
        });
    }
}
exports.OrderService = OrderService;
