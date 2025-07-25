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
exports.QuotationService = void 0;
const quotation_repo_1 = require("../repositories/quotation.repo");
const base_service_1 = require("./master/base.service");
const common_detail_repo_1 = require("../repositories/common-detail.repo");
const product_repo_1 = require("../repositories/product.repo");
const app_constant_1 = require("../../config/app.constant");
const partner_repo_1 = require("../repositories/partner.repo");
const employee_repo_1 = require("../repositories/employee.repo");
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const purchase_request_repo_1 = require("../repositories/purchase-request.repo");
const common_service_1 = require("./common.service");
const purchase_request_details_repo_1 = require("../repositories/purchase-request-details.repo");
const unit_repo_1 = require("../repositories/unit.repo");
const handle_files_1 = require("../helpers/handle-files");
const quotation_request_detail_repo_1 = require("../repositories/quotation-request-detail.repo");
const commission_service_1 = require("./commission.service");
const order_repo_1 = require("../repositories/order.repo");
const logger_1 = __importDefault(require("../logger"));
const shipping_plan_repo_1 = require("../repositories/shipping-plan.repo");
const facility_order_repo_1 = require("../repositories/facility-order.repo");
const queue_service_1 = require("./queue.service");
const job_constant_1 = require("../../config/job.constant");
const eventbus_1 = __importDefault(require("../eventbus"));
const event_constant_1 = require("../../config/event.constant");
class QuotationService extends base_service_1.BaseService {
    constructor() {
        super(new quotation_repo_1.QuotationRepo());
        this.quotationDetailRepo = new common_detail_repo_1.CommonDetailRepo();
        this.purchaseRequestDetailRepo = new purchase_request_details_repo_1.PurchaseRequestDetailRepo();
        this.productRepo = new product_repo_1.ProductRepo();
        this.unitRepo = new unit_repo_1.UnitRepo();
        this.partnerRepo = new partner_repo_1.PartnerRepo();
        this.employeeRepo = new employee_repo_1.EmployeeRepo();
        this.purchaseRequestRepo = new purchase_request_repo_1.PurchaseRequestRepo();
        this.quotationRequestDetailRepo = new quotation_request_detail_repo_1.QuotationRequestDetailRepo();
        this.commissionService = commission_service_1.CommissionService.getInstance();
        this.orderRepo = new order_repo_1.OrderRepo();
        this.shippingPlanRepo = new shipping_plan_repo_1.ShippingPlanRepo();
        this.facilityOrderRepo = new facility_order_repo_1.FacilityOrderRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new QuotationService();
        }
        return this.instance;
    }
    createSupplierQuotation(request) {
        return __awaiter(this, void 0, void 0, function* () {
            let quotationId = 0;
            yield this.validateForeignKeys(request, {
                purchase_request_id: this.purchaseRequestRepo,
                employee_id: this.employeeRepo,
            });
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f;
                let supplier = (_a = (yield this.partnerRepo.findOne({ tax: request.tax, type: app_constant_1.PartnerType.SUPPLIER }, false, tx))) === null || _a === void 0 ? void 0 : _a.id;
                if (!supplier) {
                    const supplierCode = yield common_service_1.CommonService.getCode(app_constant_1.CodeType.SUPPLIER.toUpperCase());
                    supplier = yield this.partnerRepo.create({
                        code: supplierCode,
                        tax: request.tax,
                        name: request.organization_name,
                        address: request.address,
                        representative_phone: request.phone,
                        type: request.type,
                        representative_name: request.name,
                    }, tx);
                }
                else {
                    const existQuotation = yield this.repo.findOne({ purchase_request_id: (_b = request.purchase_request_id) !== null && _b !== void 0 ? _b : null }, false, tx);
                    let files = null, quotationFiles = null;
                    if (existQuotation) {
                        if ((request.files && request.files.length > 0) ||
                            (request.quotation_files && request.quotation_files.length > 0)) {
                            files = this.parseJsonArray(existQuotation.files);
                            quotationFiles = this.parseJsonArray(existQuotation.quotation_files);
                            (_c = request.files) === null || _c === void 0 ? void 0 : _c.forEach((file) => {
                                files.push(file);
                            });
                            (_d = request.quotation_files) === null || _d === void 0 ? void 0 : _d.forEach((file) => {
                                quotationFiles.push(file);
                            });
                        }
                        yield this.repo.update({ id: existQuotation.id }, {
                            message: ((_e = existQuotation.message) !== null && _e !== void 0 ? _e : '') + ((_f = request.message) !== null && _f !== void 0 ? _f : ''),
                            files: files !== null && files !== void 0 ? files : existQuotation.files,
                            quotation_files: quotationFiles !== null && quotationFiles !== void 0 ? quotationFiles : existQuotation.quotation_files,
                        }, tx);
                        return { id: existQuotation.id };
                    }
                }
                const { detail_ids: detailIds, address, phone, employee_id, tax, name, email, purchase_request_id } = request, quotationData = __rest(request, ["detail_ids", "address", "phone", "employee_id", "tax", "name", "email", "purchase_request_id"]);
                Object.assign(quotationData, {
                    code: yield common_service_1.CommonService.getCode(app_constant_1.CodeType.QUOTATION_SUPPLIER.toUpperCase()),
                    employee: employee_id ? { connect: { id: employee_id } } : undefined,
                    partner: supplier ? { connect: { id: supplier } } : undefined,
                    purchase_request: purchase_request_id ? { connect: { id: purchase_request_id } } : undefined,
                });
                quotationId = yield this.repo.create(quotationData, tx);
                if (detailIds && detailIds.length > 0) {
                    const newDetailData = yield Promise.all(detailIds.map((idItem) => __awaiter(this, void 0, void 0, function* () {
                        const purchaseRequest = yield this.purchaseRequestDetailRepo.findOne({ id: idItem });
                        if (!purchaseRequest) {
                            throw new api_error_1.APIError({
                                message: 'common.not-found',
                                status: errors_1.ErrorCode.BAD_REQUEST,
                                errors: [`id_${idItem}.${errors_1.ErrorKey.NOT_FOUND}`],
                            });
                        }
                        const { id, unit_id, material_id } = purchaseRequest, details = __rest(purchaseRequest, ["id", "unit_id", "material_id"]);
                        Object.assign(details, {
                            product: { connect: { id: material_id } },
                            unit: { connect: { id: unit_id } },
                            quotation: { connect: { id: quotationId } },
                        });
                        return details;
                    })));
                    yield this.quotationDetailRepo.createMany(newDetailData, tx);
                }
            }));
            return { id: quotationId };
        });
    }
    createCustomerQuotation(empId, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let quotationId = 0;
            try {
                yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // await this.isExist({ code: request.code }, false, tx);
                    yield this.validateForeignKeys(request, {
                        partner_id: this.partnerRepo,
                        employee_id: this.employeeRepo,
                    }, tx);
                    const { details, files_add, files_delete, shipping_plans, facility_orders, facility_order_add, facility_order_update, facility_order_delete, add, update, delete: deletedIds, shipping_plans_add, shipping_plans_delete, shipping_plans_update } = request, quotationData = __rest(request, ["details", "files_add", "files_delete", "shipping_plans", "facility_orders", "facility_order_add", "facility_order_update", "facility_order_delete", "add", "update", "delete", "shipping_plans_add", "shipping_plans_delete", "shipping_plans_update"]);
                    const mainData = this.autoMapConnection([Object.assign(Object.assign({}, quotationData), { employee_id: empId || null })]);
                    quotationId = yield this.repo.create(mainData[0], tx);
                    yield this.validateForeignKeys(details, {
                        product_id: this.productRepo,
                        unit_id: this.unitRepo,
                        material_id: this.productRepo,
                    }, tx);
                    // handle details
                    let bulkCommissions = [];
                    for (const detail of details) {
                        const { commissions, commissions_add, commissions_update, commissions_delete } = detail, restDetail = __rest(detail, ["commissions", "commissions_add", "commissions_update", "commissions_delete"]);
                        const mapDetail = this.autoMapConnection([restDetail], { quotation_id: quotationId });
                        const detailId = yield this.quotationDetailRepo.create(mapDetail[0], tx);
                        const tempCommissions = (commissions || []).map((x) => (Object.assign(Object.assign({}, x), { quotation_request_detail_id: restDetail.quotation_request_detail_id, quotation_detail_id: detailId })));
                        bulkCommissions.push(...tempCommissions);
                    }
                    // insert bulk commission
                    const mapCommissions = this.autoMapConnection(bulkCommissions);
                    yield this.commissionService.createMany(mapCommissions, tx);
                    // shipping plan
                    if (shipping_plans && shipping_plans.length > 0) {
                        const mapShippingPlans = this.autoMapConnection(shipping_plans, { quotation_id: quotationId });
                        yield this.shippingPlanRepo.createMany(mapShippingPlans, tx);
                    }
                    // facility orders
                    if (facility_orders && facility_orders.length > 0) {
                        yield this.validateForeignKeys(facility_orders, {
                            facility_id: this.productRepo,
                        }, tx);
                        const facilityOrders = facility_orders.map((order) => {
                            const { commissions, commissions_add, commissions_update, commissions_delete } = order, restOrder = __rest(order, ["commissions", "commissions_add", "commissions_update", "commissions_delete"]);
                            return Object.assign({}, restOrder);
                        });
                        // Tạo facility orders
                        const mapFacilityOrders = this.autoMapConnection(facilityOrders, { quotation_id: quotationId });
                        const createdIds = yield this.facilityOrderRepo.createMany(mapFacilityOrders, tx);
                        // Xử lý commissions cho từng facility order
                        let bulkCommissions = [];
                        facility_orders.forEach((order, idx) => {
                            var _a;
                            if (order.commissions && Array.isArray(order.commissions) && createdIds[idx]) {
                                const facilityOrderId = typeof createdIds[idx] === 'object' && ((_a = createdIds[idx]) === null || _a === void 0 ? void 0 : _a.id)
                                    ? createdIds[idx].id
                                    : createdIds[idx];
                                const commissionsWithOrderId = order.commissions.map((c) => (Object.assign(Object.assign({}, c), { facility_order_id: facilityOrderId })));
                                bulkCommissions.push(...commissionsWithOrderId);
                            }
                        });
                        if (bulkCommissions.length > 0) {
                            yield this.commissionService.createMany(bulkCommissions, tx);
                        }
                    }
                }));
                return { id: quotationId };
            }
            catch (error) {
                eventbus_1.default.emit(event_constant_1.EVENT_DELETE_UNUSED_FILES, request.files);
                throw error;
            }
        });
    }
    validateCommissionItems(commissions) {
        if (!commissions || commissions.length === 0)
            return;
        const firstItem = commissions[0];
        const hasPrice = firstItem.price != null && firstItem.price !== 0;
        const hasQuantity = firstItem.quantity != null && firstItem.quantity !== 0;
        if (hasPrice && hasQuantity) {
            logger_1.default.warn('Rule 1: If first item has both price and quantity, only allow 1 item');
            if (commissions.length > 1) {
                throw new api_error_1.APIError({
                    message: 'common.error',
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`commissions.${errors_1.ErrorKey.INVALID}`],
                });
            }
            return;
        }
        if (hasPrice) {
            for (let i = 1; i < commissions.length; i++) {
                if (commissions[i].price == null) {
                    logger_1.default.warn(`Rule 2: Missing price for commission item ${commissions[i].key}`);
                    throw new api_error_1.APIError({
                        message: 'common.error',
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: [`price.${errors_1.ErrorKey.REQUIRED}.${commissions[i].key}`],
                    });
                }
            }
        }
        if (hasQuantity) {
            for (let i = 1; i < commissions.length; i++) {
                if (commissions[i].quantity == null) {
                    logger_1.default.warn(`Rule 3: Missing quantity for commission item ${commissions[i].key}`);
                    throw new api_error_1.APIError({
                        message: 'common.error',
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: [`quantity.${errors_1.ErrorKey.REQUIRED}.${commissions[i].key}`],
                    });
                }
            }
        }
        if (!hasPrice && !hasQuantity) {
            logger_1.default.warn('Rule 4: If first item has neither price nor quantity, all items must have both');
            throw new api_error_1.APIError({
                message: 'common.error',
                status: errors_1.ErrorCode.BAD_REQUEST,
                errors: [`commissions.${errors_1.ErrorKey.INVALID}`],
            });
        }
    }
    updateQuotation(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { delete: deleteIds, update, add, files_add, files_delete, details, shipping_plans_add, shipping_plans_delete, shipping_plans_update, shipping_plans, facility_orders, facility_order_add, facility_order_update, facility_order_delete } = request, restData = __rest(request, ["delete", "update", "add", "files_add", "files_delete", "details", "shipping_plans_add", "shipping_plans_delete", "shipping_plans_update", "shipping_plans", "facility_orders", "facility_order_add", "facility_order_update", "facility_order_delete"]);
            try {
                const itemExist = yield this.findById(id);
                if (!itemExist)
                    return { id };
                yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    yield this.isExist({ code: request.code, id }, true, tx);
                    const isCheck = !!(restData.partner_id && restData.partner_id !== itemExist.partner_id);
                    yield this.validateForeignKeys(request, {
                        partner_id: this.partnerRepo,
                    }, tx, isCheck);
                    let filesUpdate = (0, handle_files_1.handleFiles)(files_add, files_delete, itemExist.files);
                    const mainData = this.autoMapConnection([
                        Object.assign(Object.assign({}, restData), (filesUpdate !== null && { files: filesUpdate })),
                    ]);
                    yield this.repo.update({ id }, mainData[0], tx);
                    yield this.handleAdd(id, add, tx);
                    yield this.handleUpdate(itemExist, update, tx);
                    if (deleteIds && deleteIds.length > 0) {
                        yield this.quotationDetailRepo.deleteMany({ id: { in: deleteIds } }, tx);
                    }
                    // [add] shippings
                    if (shipping_plans_add && shipping_plans_add.length > 0) {
                        const mapShippingPlans = this.autoMapConnection(shipping_plans_add, { quotation_id: id });
                        yield this.shippingPlanRepo.createMany(mapShippingPlans, tx);
                    }
                    // [update] shippings
                    if (shipping_plans_update && shipping_plans_update.length > 0) {
                        yield this.validateForeignKeys(shipping_plans_update, {
                            id: this.shippingPlanRepo,
                        }, tx);
                        const mapShippingPlans = this.autoMapConnection(shipping_plans_update);
                        for (const item of mapShippingPlans) {
                            const { id } = item, restItem = __rest(item, ["id"]);
                            yield this.shippingPlanRepo.update({ id }, restItem, tx);
                        }
                    }
                    // [delete] shippings
                    if (shipping_plans_delete && shipping_plans_delete.length > 0) {
                        yield this.shippingPlanRepo.deleteMany({ id: { in: shipping_plans_delete } }, tx, false);
                    }
                    // [add] facility orders
                    if (facility_order_add && facility_order_add.length > 0) {
                        yield this.validateForeignKeys(facility_order_add, {
                            facility_id: this.productRepo,
                        }, tx);
                        const mapFacilityOrders = this.autoMapConnection(facility_order_add, { quotation_id: id });
                        yield this.facilityOrderRepo.createMany(mapFacilityOrders, tx);
                    }
                    // [update] facility orders
                    if (facility_order_update && facility_order_update.length > 0) {
                        yield this.validateForeignKeys(facility_order_update, {
                            id: this.quotationDetailRepo,
                            facility_id: this.productRepo,
                        }, tx);
                        const mapFacilityOrders = this.autoMapConnection(facility_order_update);
                        for (const item of mapFacilityOrders) {
                            const { id } = item, restItem = __rest(item, ["id"]);
                            yield this.facilityOrderRepo.update({ id }, restItem, tx);
                        }
                    }
                    // [delete] facility orders
                    if (facility_order_delete && facility_order_delete.length > 0) {
                        yield this.facilityOrderRepo.deleteMany({ id: { in: facility_order_delete } }, tx, false);
                    }
                }));
                // clean up file
                eventbus_1.default.emit(event_constant_1.EVENT_DELETE_UNUSED_FILES, files_delete);
                return { id };
            }
            catch (error) {
                eventbus_1.default.emit(event_constant_1.EVENT_DELETE_UNUSED_FILES, files_add);
                throw error;
            }
        });
    }
    handleAdd(quotationId, add, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!add || add.length === 0)
                return;
            yield this.validateForeignKeys(add, {
                product_id: this.productRepo,
                unit_id: this.productRepo,
            }, tx);
            let bulkCommissions = [];
            for (const item of add) {
                const { commissions, commissions_add, commissions_update, commissions_delete } = item, restItem = __rest(item, ["commissions", "commissions_add", "commissions_update", "commissions_delete"]);
                const mapDetail = this.autoMapConnection([restItem], { quotation_id: quotationId });
                const detailId = yield this.quotationDetailRepo.create(mapDetail[0], tx);
                const tempCommissions = (commissions || []).map((x) => (Object.assign(Object.assign({}, x), { quotation_request_detail_id: restItem.quotation_request_detail_id, quotation_detail_id: detailId })));
                bulkCommissions.push(...tempCommissions);
            }
            yield this.commissionService.createMany(bulkCommissions, tx);
        });
    }
    handleUpdate(itemExist, update, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!update || update.length === 0)
                return;
            const isCheck = this.canCheckForeignKeys(update, itemExist, [
                'product_id',
                'unit_id',
                'quotation_request_detail_id',
            ]);
            yield this.validateForeignKeys(update, {
                id: this.quotationDetailRepo,
                product_id: this.productRepo,
                unit_id: this.productRepo,
                quotation_request_detail_id: this.quotationRequestDetailRepo,
            }, tx, isCheck);
            let bulkCommissionAdd = [];
            let bulkCommissionUpdate = [];
            let bulkCommissionDelete = [];
            for (const item of update) {
                const { id, commissions, commissions_add = [], commissions_update = [], commissions_delete = [] } = item, restItem = __rest(item, ["id", "commissions", "commissions_add", "commissions_update", "commissions_delete"]);
                const mapDetail = this.autoMapConnection([restItem], { quotation_id: itemExist.id });
                yield this.quotationDetailRepo.update({ id }, mapDetail[0], tx);
                const tempCommissions = (commissions_add || []).map((x) => (Object.assign(Object.assign({}, x), { quotation_request_detail_id: restItem.quotation_request_detail_id, quotation_detail_id: item.id })));
                bulkCommissionAdd.push(...tempCommissions);
                bulkCommissionUpdate.push(...commissions_update);
                bulkCommissionDelete.push(...commissions_delete);
            }
            if (bulkCommissionAdd.length > 0) {
                yield this.commissionService.createMany(bulkCommissionAdd, tx);
            }
            else if (bulkCommissionUpdate.length > 0) {
                yield this.commissionService.updateMany(bulkCommissionUpdate, tx);
            }
            else if (bulkCommissionDelete.length > 0) {
                yield this.commissionService.deleteMany(bulkCommissionDelete, tx);
            }
        });
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isMain, type } = query, otherQuery = __rest(query, ["isMain", "type"]);
            const where = Object.assign(Object.assign({}, otherQuery), { type });
            if (type === app_constant_1.QuotationType.SUPPLIER) {
                where.type = type;
                if (isMain === true) {
                    where.NOT = { purchase_request_id: null };
                }
                else if (isMain === false) {
                    where.purchase_request_id = null;
                    delete where.organization_id;
                }
            }
            const data = yield this.repo.paginate(where, true);
            return data;
        });
    }
    updateQuotationSupplier(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.update(id, {
                status: body.status,
                rejected_reason: body.rejected_reason,
            });
            return { id };
        });
    }
    approve(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const quotation = yield this.repo.findFirst({ id }, true);
            if (!quotation || !quotation.status)
                return { id };
            if (quotation.type === app_constant_1.QuotationType.SUPPLIER) {
                return this.updateQuotationSupplier(id, body);
            }
            const statusMap = {
                confirmed: {
                    pending: 'customer_pending',
                    customer_pending: 'confirmed',
                },
                rejected: {
                    pending: 'rejected',
                    customer_pending: 'customer_rejected',
                },
            };
            if (!statusMap[body.status][quotation.status]) {
                throw new api_error_1.APIError({
                    message: 'common.error',
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`status.${errors_1.ErrorKey.INVALID}`],
                });
            }
            const { files } = body, restData = __rest(body, ["files"]);
            let dataToUpdate = Object.assign({}, restData);
            if (files && files.length > 0) {
                let filesUpdate = (0, handle_files_1.handleFiles)(files, [], (quotation === null || quotation === void 0 ? void 0 : quotation.files) || []);
                dataToUpdate.files = filesUpdate;
            }
            yield this.repo.update({ id }, Object.assign(Object.assign({}, dataToUpdate), { status: statusMap[body.status][quotation.status] }));
            if (statusMap[body.status][quotation.status] === app_constant_1.CommonApproveStatus.CONFIRMED) {
                logger_1.default.info('create new order commercial');
                // nếu khách hàng đồng ý => tạo đơn hàng thương mại
                yield (yield queue_service_1.QueueService.getQueue(job_constant_1.CREATE_ORDER_FROM_QUOTATION_JOB)).add(job_constant_1.CREATE_ORDER_FROM_QUOTATION_JOB, { id });
            }
            return { id };
        });
    }
    createOrderFromQuotation(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const quotation = yield this.repo.findFirst({ id }, true);
            if (!quotation) {
                logger_1.default.error(`Quotation with id ${id} not found`);
                return;
            }
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f;
                const orderData = {
                    type: app_constant_1.OrderType.COMMERCIAL,
                    code: yield common_service_1.CommonService.getCode(app_constant_1.CodeType.ORDER.toUpperCase()),
                    status: app_constant_1.OrderStatus.CONFIRMED,
                    partner_id: (_a = quotation.partner_id) !== null && _a !== void 0 ? _a : undefined,
                    organization_id: (_b = quotation.organization_id) !== null && _b !== void 0 ? _b : undefined,
                    employee_id: (_c = quotation.employee_id) !== null && _c !== void 0 ? _c : undefined,
                    files: (quotation === null || quotation === void 0 ? void 0 : quotation.files) || [],
                    product_quality: quotation === null || quotation === void 0 ? void 0 : quotation.product_quality,
                    delivery_location: quotation === null || quotation === void 0 ? void 0 : quotation.delivery_location,
                    delivery_method: quotation === null || quotation === void 0 ? void 0 : quotation.delivery_method,
                    delivery_time: quotation === null || quotation === void 0 ? void 0 : quotation.delivery_time,
                    payment_note: quotation === null || quotation === void 0 ? void 0 : quotation.payment_note,
                    additional_note: quotation === null || quotation === void 0 ? void 0 : quotation.additional_note,
                };
                const mapOrderData = this.autoMapConnection([orderData]);
                const orderId = yield this.orderRepo.create(mapOrderData[0], tx);
                // order details
                const dataDetails = (_d = quotation === null || quotation === void 0 ? void 0 : quotation.details) === null || _d === void 0 ? void 0 : _d.map((x) => {
                    return {
                        id: x.id,
                        order_id: orderId,
                    };
                });
                yield this.quotationDetailRepo.updateMany(dataDetails, tx);
                // shipping plans
                const dataShippingPlans = (_e = quotation === null || quotation === void 0 ? void 0 : quotation.shipping_plans) === null || _e === void 0 ? void 0 : _e.map((x) => {
                    return {
                        id: x.id,
                        order_id: orderId,
                    };
                });
                // facility orders
                const dataFacilityOrders = (_f = quotation === null || quotation === void 0 ? void 0 : quotation.facility_orders) === null || _f === void 0 ? void 0 : _f.map((x) => {
                    return {
                        id: x.id,
                        order_id: orderId,
                    };
                });
                yield this.facilityOrderRepo.updateMany(dataFacilityOrders, tx);
                yield this.shippingPlanRepo.updateMany(dataShippingPlans, tx);
            }));
        });
    }
}
exports.QuotationService = QuotationService;
