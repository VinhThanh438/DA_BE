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
exports.InvoiceService = void 0;
const base_service_1 = require("./master/base.service");
const common_detail_repo_1 = require("../repositories/common-detail.repo");
const invoice_repo_1 = require("../repositories/invoice.repo");
const employee_repo_1 = require("../repositories/employee.repo");
const partner_repo_1 = require("../repositories/partner.repo");
const product_repo_1 = require("../repositories/product.repo");
const app_constant_1 = require("../../config/app.constant");
const bank_repo_1 = require("../repositories/bank.repo");
const contract_repo_1 = require("../repositories/contract.repo");
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const order_repo_1 = require("../repositories/order.repo");
const transaction_repo_1 = require("../repositories/transaction.repo");
const invoice_detail_repo_1 = require("../repositories/invoice-detail.repo");
const order_service_1 = require("./order.service");
const common_service_1 = require("./common.service");
const eventbus_1 = __importDefault(require("../eventbus"));
const event_constant_1 = require("../../config/event.constant");
const shipping_plan_repo_1 = require("../repositories/shipping-plan.repo");
const logger_1 = __importDefault(require("../logger"));
const inventory_repo_1 = require("../repositories/inventory.repo");
const facility_order_repo_1 = require("../repositories/facility-order.repo");
const facility_repo_1 = require("../repositories/facility.repo");
class InvoiceService extends base_service_1.BaseService {
    constructor() {
        super(new invoice_repo_1.InvoiceRepo());
        this.invoiceDetailRepo = new invoice_detail_repo_1.InvoiceDetailRepo();
        this.orderDetailRepo = new common_detail_repo_1.CommonDetailRepo();
        this.productRepo = new product_repo_1.ProductRepo();
        this.partnerRepo = new partner_repo_1.PartnerRepo();
        this.employeeRepo = new employee_repo_1.EmployeeRepo();
        this.bankRepo = new bank_repo_1.BankRepo();
        this.contractRepo = new contract_repo_1.ContractRepo();
        this.orderRepo = new order_repo_1.OrderRepo();
        this.transactionRepo = new transaction_repo_1.TransactionRepo();
        this.orderService = order_service_1.OrderService.getInstance();
        this.shippingPlanRepo = new shipping_plan_repo_1.ShippingPlanRepo();
        this.inventoryRepo = new inventory_repo_1.InventoryRepo();
        this.facilityRepo = new facility_repo_1.FacilityRepo();
        this.facilityOrderRepo = new facility_order_repo_1.FacilityOrderRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new InvoiceService();
        }
        return this.instance;
    }
    attachPaymentInfoToOrder(invoice) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const transactionData = yield this.transactionRepo.findMany({
                invoice_id: invoice.id,
            });
            const totalPaid = transactionData
                .filter((t) => t.order_type === app_constant_1.TransactionOrderType.ORDER)
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const totalCommissionPaid = transactionData
                .filter((t) => t.order_type === app_constant_1.TransactionOrderType.COMMISSION)
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const detailInfos = yield Promise.all(((_a = invoice.details) !== null && _a !== void 0 ? _a : []).map((detail) => __awaiter(this, void 0, void 0, function* () {
                const info = yield this.orderDetailRepo.findOne({ id: detail.order_detail_id });
                return { detail, info };
            })));
            let total_amount_debt = 0;
            let total_commission_debt = 0;
            for (const { info } of detailInfos) {
                if (!info)
                    continue;
                const quantity = Number(info.imported_quantity || 0);
                const price = Number(info.price || 0);
                const vat = Number(info.vat || 0);
                const commission = Number(info.commission || 0);
                const detailTotal = quantity * price;
                const detailVat = (detailTotal * vat) / 100;
                const detailTotalAfterVat = detailTotal + detailVat;
                const detailTotalCommission = (detailTotal * commission) / 100;
                total_amount_debt += detailTotalAfterVat - totalPaid;
                total_commission_debt += detailTotalCommission - totalCommissionPaid;
            }
            return Object.assign(Object.assign({}, invoice), { total_amount_paid: totalPaid, total_amount_debt, total_commission_paid: totalCommissionPaid, total_commission_debt });
        });
    }
    handleInvoiceTotal(invoice) {
        return __awaiter(this, void 0, void 0, function* () {
            let total_money = 0;
            let total_vat = 0;
            let total_commission = 0;
            // Check if details exists and is iterable
            if (invoice.details && Array.isArray(invoice.details) && invoice.details.length > 0) {
                for (const detail of invoice.details) {
                    const orderDetail = yield this.orderDetailRepo.findOne({ id: detail.order_detail_id });
                    if (!orderDetail)
                        continue;
                    const quantity = Number(orderDetail.imported_quantity || orderDetail.quantity);
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
                return Object.assign(Object.assign({}, invoice), { total_money,
                    total_vat,
                    total_amount,
                    total_commission });
            }
            else {
                return Object.assign(Object.assign({}, invoice), { total_money,
                    total_vat, total_amount: 0, total_commission });
            }
        });
    }
    enrichInvoiceTotals(responseData) {
        return __awaiter(this, void 0, void 0, function* () {
            const enrichedData = yield Promise.all(responseData.data.map((invoice) => __awaiter(this, void 0, void 0, function* () {
                return this.handleInvoiceTotal(invoice);
            })));
            return Object.assign(Object.assign({}, responseData), { data: enrichedData });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let result = yield this.repo.findOne({ id }, true);
            if (!result) {
                throw new api_error_1.APIError({
                    message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`invoice.${errors_1.ErrorKey.NOT_FOUND}`],
                });
            }
            const detailsWithProgress = yield Promise.all((_a = result === null || result === void 0 ? void 0 : result.details) === null || _a === void 0 ? void 0 : _a.map((x) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const progress = yield this.orderService.getOrderDetailPurchaseProcessing(Object.assign(Object.assign({}, x.order_detail), { order_id: (_a = result === null || result === void 0 ? void 0 : result.order) === null || _a === void 0 ? void 0 : _a.id }));
                return Object.assign(Object.assign({}, x), { order_detail: Object.assign(Object.assign({}, x.order_detail), { progress }) });
            })));
            return Object.assign(Object.assign({}, result), { details: detailsWithProgress });
        });
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.repo.paginate(query, true);
            // Calculate summary totals
            let summary_total_money = 0;
            let summary_total_vat = 0;
            let summary_total_commission = 0;
            let summary_total_payment = 0;
            let summary_total_debt = 0;
            result.data = yield Promise.all(result.data.map((item) => __awaiter(this, void 0, void 0, function* () {
                // Calculate totals for this invoice using handleInvoiceTotal
                const invoiceWithTotals = yield this.handleInvoiceTotal(item);
                const totalQuantity = item.order
                    ? yield this.orderService.calculateTotalConvertedQuantity(item.order.id)
                    : 0;
                const transactionData = yield this.transactionRepo.findMany({
                    invoice_id: item.id,
                });
                const totalPayment = transactionData.reduce((sum, t) => sum + Number(t.amount || 0), 0);
                const totalDebt = invoiceWithTotals.total_amount - totalPayment;
                const newDetails = yield Promise.all(item.details.map((detail) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    const progress = yield this.orderService.getOrderDetailPurchaseProcessing(Object.assign(Object.assign({}, detail), { order_id: (_a = item.order) === null || _a === void 0 ? void 0 : _a.id, product: (_b = detail.order_detail) === null || _b === void 0 ? void 0 : _b.product }));
                    return Object.assign(Object.assign({}, detail), { progress });
                })));
                // Add to summary totals
                summary_total_money += invoiceWithTotals.total_money || 0;
                summary_total_vat += invoiceWithTotals.total_vat || 0;
                summary_total_commission += invoiceWithTotals.total_commission || 0;
                summary_total_payment += totalPayment;
                summary_total_debt += totalDebt;
                return Object.assign(Object.assign({}, invoiceWithTotals), { details: newDetails, total_quantity: totalQuantity, total_payment: parseFloat(totalPayment.toFixed(2)), total_debt: parseFloat(totalDebt.toFixed(2)) });
            })));
            const summary_total_amount = summary_total_money + summary_total_vat;
            return Object.assign(Object.assign({}, result), { summary: {
                    total_money: parseFloat(summary_total_money.toFixed(2)),
                    total_vat: parseFloat(summary_total_vat.toFixed(2)),
                    total_amount: parseFloat(summary_total_amount.toFixed(2)),
                    total_commission: parseFloat(summary_total_commission.toFixed(2)),
                    total_payment: parseFloat(summary_total_payment.toFixed(2)),
                    total_debt: parseFloat(summary_total_debt.toFixed(2)),
                } });
        });
    }
    createSellInvoice(request, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            let invoiceId = 0;
            yield this.validateForeignKeys(request, {
                inventory_id: this.inventoryRepo,
                order_id: this.orderRepo,
            }, tx);
            const runTransaction = (transaction) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const inventoryData = (yield this.inventoryRepo.findOne({ id: request.inventory_id }, true, transaction));
                const partnerId = request.partner_id ? request.partner_id : (_a = inventoryData === null || inventoryData === void 0 ? void 0 : inventoryData.order) === null || _a === void 0 ? void 0 : _a.partner_id;
                request.partner_id = partnerId;
                request.employee_id = inventoryData.employee_id;
                const { details, shipping_plan_id } = request, invoiceData = __rest(request, ["details", "shipping_plan_id"]);
                // Loại bỏ trường details khỏi dữ liệu tạo invoice
                const mappedData = this.autoMapConnection([Object.assign({}, invoiceData)]);
                const body = mappedData[0];
                if (details && details.length > 0) {
                    invoiceData.content = yield common_service_1.CommonService.getContent(details);
                }
                body.type = app_constant_1.InvoiceType.SELL;
                invoiceId = yield this.repo.create(body, transaction);
                if (shipping_plan_id) {
                    const shippingPlan = yield this.shippingPlanRepo.findOne({ id: shipping_plan_id }, false, transaction);
                    if (shippingPlan && shippingPlan.vat && shippingPlan.vat > 0) {
                        const totalPrice = Number(shippingPlan.price || 0) * Number(shippingPlan.completed_quantity || 0);
                        const vat = (totalPrice * (shippingPlan.vat || 0)) / 100;
                        yield this.transactionRepo.create({
                            type: app_constant_1.TransactionType.OUT,
                            order_type: app_constant_1.TransactionOrderType.DELIVERY,
                            shipping_plan: { connect: { id: shipping_plan_id } },
                            amount: totalPrice + vat,
                            invoice: { connect: { id: invoiceId } },
                            partner: { connect: { id: shippingPlan.partner_id } },
                            organization: { connect: { id: shippingPlan.organization_id } },
                            time_at: invoiceData.time_at,
                            order: shippingPlan.order_id ? { connect: { id: shippingPlan.order_id } } : undefined,
                            note: 'Phát sinh giảm cho vận chuyển có VAT',
                        }, transaction);
                        yield this.shippingPlanRepo.update({ id: shipping_plan_id }, { is_done: true }, transaction);
                        logger_1.default.info(`Increased amount with VAT generated for shipping plan ID: ${shipping_plan_id}`);
                    }
                }
                if (details && details.length > 0) {
                    yield this.validateForeignKeys(details, {
                        order_detail_id: this.orderDetailRepo,
                    }, transaction);
                    const mappedData = this.autoMapConnection(details, { invoice_id: invoiceId });
                    yield this.invoiceDetailRepo.createMany(mappedData, transaction);
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
            if (request.order_id) {
                eventbus_1.default.emit(event_constant_1.EVENT_INVOICE_CREATED, { orderId: request.order_id, invoiceId });
            }
            return { id: invoiceId };
        });
    }
    createFacilityInvoice(request, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            let invoiceId = 0;
            yield this.validateForeignKeys(request, {
                facility_id: this.facilityRepo,
            }, tx);
            const runTransaction = (transaction) => __awaiter(this, void 0, void 0, function* () {
                const orderData = (yield this.orderRepo.findOne({ id: request.order_id }, false, transaction));
                request.partner_id = orderData.partner_id;
                request.employee_id = orderData.employee_id;
                const { facility_orders } = request, invoiceData = __rest(request, ["facility_orders"]);
                const mappedData = this.autoMapConnection([Object.assign({}, invoiceData)]);
                const body = mappedData[0];
                invoiceId = yield this.repo.create(body, transaction);
                if (facility_orders && facility_orders.length > 0) {
                    const mappedData = this.autoMapConnection(facility_orders, { invoice_id: invoiceId });
                    yield this.facilityOrderRepo.createMany(mappedData, transaction);
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
            if (request.order_id) {
                eventbus_1.default.emit(event_constant_1.EVENT_INVOICE_CREATED, { orderId: request.order_id, invoiceId });
            }
            return { id: invoiceId };
        });
    }
    createInvoice(request, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            let invoiceId = 0;
            yield this.isExist({ code: request.code });
            if (request.type === app_constant_1.InvoiceType.SELL) {
                return this.createSellInvoice(request, tx);
            }
            else if (request.type === app_constant_1.InvoiceType.FACILITY) {
                return this.createFacilityInvoice(request, tx);
            }
            yield this.validateForeignKeys(request, {
                order_id: this.orderRepo,
                shipping_plan_id: this.shippingPlanRepo,
            }, tx);
            const runTransaction = (transaction) => __awaiter(this, void 0, void 0, function* () {
                const orderData = (yield this.orderRepo.findOne({ id: request.order_id }, false, transaction));
                request.partner_id = orderData.partner_id;
                request.employee_id = orderData.employee_id;
                const { details, shipping_plan_id } = request, invoiceData = __rest(request, ["details", "shipping_plan_id"]);
                // Loại bỏ trường details khỏi dữ liệu tạo invoice
                const mappedData = this.autoMapConnection([Object.assign({}, invoiceData)]);
                const body = mappedData[0];
                if (details && details.length > 0) {
                    invoiceData.content = yield common_service_1.CommonService.getContent(details);
                }
                body.type = shipping_plan_id ? app_constant_1.InvoiceType.DELIVERY : request.type;
                invoiceId = yield this.repo.create(body, transaction);
                if (shipping_plan_id) {
                    const shippingPlan = yield this.shippingPlanRepo.findOne({ id: shipping_plan_id }, false, transaction);
                    if (shippingPlan && shippingPlan.vat && shippingPlan.vat > 0) {
                        const totalPrice = Number(shippingPlan.price || 0) * Number(shippingPlan.completed_quantity || 0);
                        const vat = (totalPrice * (shippingPlan.vat || 0)) / 100;
                        yield this.transactionRepo.create({
                            type: app_constant_1.TransactionType.IN,
                            order_type: app_constant_1.TransactionOrderType.DELIVERY,
                            shipping_plan: { connect: { id: shipping_plan_id } },
                            amount: totalPrice + vat,
                            invoice: { connect: { id: invoiceId } },
                            partner: { connect: { id: shippingPlan.partner_id } },
                            organization: { connect: { id: shippingPlan.organization_id } },
                            time_at: invoiceData.time_at,
                            order: shippingPlan.order_id ? { connect: { id: shippingPlan.order_id } } : undefined,
                            note: 'Phát sinh tăng cho vận chuyển có VAT',
                        }, transaction);
                        yield this.shippingPlanRepo.update({ id: shipping_plan_id }, { is_done: true }, transaction);
                        logger_1.default.info(`Increased amount with VAT generated for shipping plan ID: ${shipping_plan_id}`);
                    }
                }
                if (details && details.length > 0) {
                    yield this.validateForeignKeys(details, {
                        order_detail_id: this.orderDetailRepo,
                    }, transaction);
                    const mappedData = this.autoMapConnection(details, { invoice_id: invoiceId });
                    yield this.invoiceDetailRepo.createMany(mappedData, transaction);
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
            if (request.order_id) {
                const eventData = { orderId: request.order_id, invoiceId };
                eventbus_1.default.emit(event_constant_1.EVENT_INVOICE_CREATED, eventData);
                eventbus_1.default.emit(event_constant_1.EVENT_UPDATE_LOAN, eventData);
            }
            return { id: invoiceId };
        });
    }
    updateInvoice(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.findById(id);
            yield this.isExist({ code: request.code, id }, true);
            yield this.validateForeignKeys(request, {
                partner_id: this.partnerRepo,
                employee_id: this.employeeRepo,
                bank_id: this.bankRepo,
                contract_id: this.contractRepo,
                order_id: this.orderRepo,
            });
            const { delete: deleteItems, update, add } = request, body = __rest(request, ["delete", "update", "add"]);
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                yield this.repo.update({ id }, body, tx);
                const detailItems = [...(request.add || []), ...(request.update || [])];
                if (detailItems.length > 0) {
                    yield this.validateForeignKeys(detailItems, {
                        product_id: this.productRepo,
                        unit_id: this.productRepo,
                    }, tx);
                }
                const mappedDetails = {
                    add: this.mapDetails(request.add || [], { invoice_id: id }),
                    update: this.mapDetails(request.update || [], { invoice_id: id }),
                    delete: request.delete,
                };
                const filteredData = {
                    add: this.filterData(mappedDetails.add, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['key']),
                    update: this.filterData(mappedDetails.update, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['key']),
                    delete: mappedDetails.delete,
                };
                if (filteredData.add.length > 0 ||
                    filteredData.update.length > 0 ||
                    (((_a = filteredData.delete) === null || _a === void 0 ? void 0 : _a.length) || 0) > 0) {
                    yield this.updateChildEntity(filteredData, this.invoiceDetailRepo, tx);
                }
            }));
            return { id };
        });
    }
    updateInvoiceTotal(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const invoiceId = data.invoiceId;
            const invoice = yield this.repo.findOne({ id: invoiceId }, true);
            const totalInvoice = yield this.handleInvoiceTotal(invoice);
            const totalInvoiceDebt = yield this.attachPaymentInfoToOrder(invoice);
            yield this.repo.update({ id: invoiceId }, {
                total_amount_paid: totalInvoiceDebt.total_amount_paid,
                total_amount_debt: totalInvoiceDebt.total_amount_debt,
                total_commission_paid: totalInvoiceDebt.total_commission_paid,
                total_commission_debt: totalInvoiceDebt.total_commission_debt,
                total_amount: totalInvoice.total_amount,
                total_vat: totalInvoice.total_vat,
                total_commission: totalInvoice.total_commission,
                total_money: totalInvoice.total_money,
            });
            const debtData = {
                time_at: invoice === null || invoice === void 0 ? void 0 : invoice.invoice_date,
                debt_type: (invoice === null || invoice === void 0 ? void 0 : invoice.type) === app_constant_1.InvoiceType.PURCHASE ? app_constant_1.DebtType.EXPENSE : app_constant_1.DebtType.INCOME,
                partner_id: invoice === null || invoice === void 0 ? void 0 : invoice.partner_id,
                invoice_id: invoiceId,
                order_id: invoice === null || invoice === void 0 ? void 0 : invoice.order_id,
                total_amount: totalInvoiceDebt.total_amount,
                total_commission: totalInvoiceDebt.total_commission,
            };
            eventbus_1.default.emit(event_constant_1.EVENT_DEBT_INCURRED, debtData);
        });
    }
}
exports.InvoiceService = InvoiceService;
