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
exports.PurchaseRequestService = void 0;
const purchase_request_repo_1 = require("../repositories/purchase-request.repo");
const base_service_1 = require("./master/base.service");
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const app_constant_1 = require("../../config/app.constant");
const employee_repo_1 = require("../repositories/employee.repo");
const organization_repo_1 = require("../repositories/organization.repo");
const product_repo_1 = require("../repositories/product.repo");
const purchase_request_details_repo_1 = require("../repositories/purchase-request-details.repo");
const production_repo_1 = require("../repositories/production.repo");
const order_repo_1 = require("../repositories/order.repo");
const handle_files_1 = require("../helpers/handle-files");
const unit_repo_1 = require("../repositories/unit.repo");
const eventbus_1 = __importDefault(require("../eventbus"));
const event_constant_1 = require("../../config/event.constant");
class PurchaseRequestService extends base_service_1.BaseService {
    constructor() {
        super(new purchase_request_repo_1.PurchaseRequestRepo());
        this.purchaseRequestDetailRepo = new purchase_request_details_repo_1.PurchaseRequestDetailRepo();
        this.employeeRepo = new employee_repo_1.EmployeeRepo();
        this.organizationRepo = new organization_repo_1.OrganizationRepo();
        this.productRepo = new product_repo_1.ProductRepo();
        this.productionRepo = new production_repo_1.ProductionRepo();
        this.orderRepo = new order_repo_1.OrderRepo();
        this.unitRepo = new unit_repo_1.UnitRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PurchaseRequestService();
        }
        return this.instance;
    }
    createPurchaseRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            let purchaseRequestId = 0;
            yield this.isExist({ code: request.code });
            yield this.validateForeignKeys(request, {
                employee_id: this.employeeRepo,
                production_id: this.productionRepo,
                order_id: this.orderRepo,
                organization_id: this.organizationRepo,
            });
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const { details } = request, quotationData = __rest(request, ["details"]);
                purchaseRequestId = yield this.repo.create(quotationData, tx);
                if (details && details.length > 0) {
                    yield this.validateForeignKeys(details, {
                        material_id: this.productRepo,
                    }, tx);
                    const mappedDetails = details.map((item) => {
                        const { material_id, unit_id } = item, rest = __rest(item, ["material_id", "unit_id"]);
                        return Object.assign(Object.assign({}, rest), { purchase_request: purchaseRequestId ? { connect: { id: purchaseRequestId } } : undefined, material: material_id ? { connect: { id: material_id } } : undefined, unit: unit_id ? { connect: { id: unit_id } } : undefined });
                    });
                    const filteredData = this.filterData(mappedDetails, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['details']);
                    yield this.purchaseRequestDetailRepo.createMany(filteredData, tx);
                }
                else {
                    throw new api_error_1.APIError({
                        message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                        status: errors_1.ErrorCode.BAD_REQUEST,
                        errors: [`details.${errors_1.ErrorKey.INVALID}`],
                    });
                }
            }));
            return { id: purchaseRequestId };
        });
    }
    updatePurchaseRequest(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const purchaseReqExist = yield this.findById(id);
            yield this.isExist({ code: request.code, id }, true);
            const { add, update, delete: deleteIds, files_add, files_delete } = request, purchaseRequestData = __rest(request, ["add", "update", "delete", "files_add", "files_delete"]);
            yield this.validateForeignKeys(request, {
                employee_id: this.employeeRepo,
            });
            try {
                yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // handle files
                    let filesUpdate = (0, handle_files_1.handleFiles)(files_add, files_delete, purchaseReqExist === null || purchaseReqExist === void 0 ? void 0 : purchaseReqExist.files);
                    yield this.repo.update({ id }, Object.assign(Object.assign({}, purchaseRequestData), (filesUpdate !== null && { files: filesUpdate })), tx);
                    // [add] purchase request details
                    if (add && add.length > 0) {
                        yield this.validateForeignKeys(add, {
                            material_id: this.productRepo,
                            unit_id: this.unitRepo,
                        }, tx);
                        const data = add.map((item) => {
                            const { key } = item, rest = __rest(item, ["key"]);
                            return Object.assign(Object.assign({}, rest), { purchase_request_id: id });
                        });
                        yield this.purchaseRequestDetailRepo.createMany(data, tx);
                    }
                    // [update] purchase request details
                    if (update && update.length > 0) {
                        yield this.validateForeignKeys(update, {
                            id: this.purchaseRequestDetailRepo,
                            product_id: this.productRepo,
                            unit_id: this.unitRepo,
                        }, tx);
                        const data = update.map((item) => {
                            const { key } = item, rest = __rest(item, ["key"]);
                            return rest;
                        });
                        yield this.purchaseRequestDetailRepo.updateMany(data, tx);
                    }
                    // [delete] order details
                    if (deleteIds && deleteIds.length > 0) {
                        yield this.purchaseRequestDetailRepo.deleteMany({ id: { in: deleteIds } }, tx, false);
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
}
exports.PurchaseRequestService = PurchaseRequestService;
