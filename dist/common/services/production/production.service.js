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
exports.ProductionService = void 0;
const production_repo_1 = require("../../repositories/production.repo");
const base_service_1 = require("../master/base.service");
const employee_repo_1 = require("../../repositories/employee.repo");
const partner_repo_1 = require("../../repositories/partner.repo");
const organization_repo_1 = require("../../repositories/organization.repo");
const product_repo_1 = require("../../repositories/product.repo");
const api_error_1 = require("../../error/api.error");
const errors_1 = require("../../errors");
const production_detail_service_1 = require("./production-detail.service");
const order_repo_1 = require("../../repositories/order.repo");
const common_detail_repo_1 = require("../../repositories/common-detail.repo");
const raw_material_service_1 = require("./raw-material.service");
const mesh_service_1 = require("../mesh.service");
const mesh_detail_repo_1 = require("../../repositories/mesh-detail.repo");
const mesh_production_detail_service_1 = require("./mesh-production-detail.service");
class ProductionService extends base_service_1.BaseService {
    constructor() {
        super(new production_repo_1.ProductionRepo());
        this.partnerRepo = new partner_repo_1.PartnerRepo();
        this.employeeRepo = new employee_repo_1.EmployeeRepo();
        this.organizationRepo = new organization_repo_1.OrganizationRepo();
        this.productRepo = new product_repo_1.ProductRepo();
        this.orderRepo = new order_repo_1.OrderRepo();
        this.orderDetailRepo = new common_detail_repo_1.CommonDetailRepo();
        this.meshDetailRepo = new mesh_detail_repo_1.MeshDetailRepo();
        this.productionDetailService = production_detail_service_1.ProductionDetailService.getInstance();
        this.meshProductionDetailService = mesh_production_detail_service_1.MeshProductionDetailService.getInstance();
        this.rawMaterialService = raw_material_service_1.RawMaterialService.getInstance();
        this.meshService = mesh_service_1.MeshService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProductionService();
        }
        return this.instance;
    }
    create(body, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateForeignKeys(body, {
                // partner_id: this.partnerRepo,
                // employee_id: this.employeeRepo,
                order_id: this.orderRepo,
                organization_id: this.organizationRepo,
            }, tx);
            yield this.isExist({ code: body.code }, false, tx);
            const { details, raw_materials } = body, productionData = __rest(body, ["details", "raw_materials"]);
            if (!details || details.length === 0) {
                throw new api_error_1.APIError({
                    message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`details.${errors_1.ErrorKey.INVALID}`],
                });
            }
            yield this.validateForeignKeys(details, {
                order_detail_id: this.orderDetailRepo,
            }, tx);
            const runTransaction = (tx) => __awaiter(this, void 0, void 0, function* () {
                const mapData = this.autoMapConnection([productionData]);
                const productionId = yield this.repo.create(mapData[0], tx);
                const mapDetailData = this.autoMapConnection(details, { production_id: productionId });
                yield this.productionDetailService.createMany(mapDetailData, tx);
                return { id: productionId };
            });
            return tx ? runTransaction(tx) : this.db.$transaction(runTransaction);
        });
    }
    updateProduction(id, body, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.findById(id);
            yield this.validateForeignKeys(body, {
                partner_id: this.partnerRepo,
                employee_id: this.employeeRepo,
                order_id: this.orderRepo,
                organization_id: this.organizationRepo,
            }, tx);
            yield this.isExist({ code: body.code }, false, tx);
            const { details } = body, productionData = __rest(body, ["details"]);
            if (!details || details.length === 0) {
                throw new api_error_1.APIError({
                    message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`details.${errors_1.ErrorKey.INVALID}`],
                });
            }
            yield this.validateForeignKeys(details, {
                order_detail_id: this.orderDetailRepo,
            }, tx);
            const runTransaction = (tx) => __awaiter(this, void 0, void 0, function* () {
                const mapData = this.autoMapConnection([productionData]);
                const productionId = yield this.repo.update({ id }, mapData[0], tx);
                const mapDetailData = this.autoMapConnection(details, { production_id: productionId });
                yield this.productionDetailService.createMany(mapDetailData, tx);
                return { id: productionId };
            });
            return tx ? runTransaction(tx) : this.db.$transaction(runTransaction);
        });
    }
    /**
     * Tạo mới lệnh sản xuất lưới thép hàn
     */
    createMeshProduction(body, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateForeignKeys(body, {
                organization_id: this.organizationRepo,
                order_od: this.orderRepo,
            }, tx);
            const { mesh_production_details, raw_materials, type } = body, productionData = __rest(body, ["mesh_production_details", "raw_materials", "type"]);
            const runTransaction = (tx) => __awaiter(this, void 0, void 0, function* () {
                const mapData = this.autoMapConnection([productionData]);
                const id = yield this.repo.create(mapData[0], tx);
                const mapDetailData = this.autoMapConnection(mesh_production_details, { mesh_production_id: id });
                yield this.meshProductionDetailService.createMany(mapDetailData, tx);
                const mapRawMaterialData = this.autoMapConnection(raw_materials || [], { mesh_production_id: id });
                yield this.rawMaterialService.createMany(mapRawMaterialData, tx);
                // Tính toán tổng số lượng, trọng lượng, diện tích (new)
                yield this.calculateAndUpdateTotal(mesh_production_details, id, tx);
                return { id };
            });
            return tx ? runTransaction(tx) : yield this.db.$transaction(runTransaction);
        });
    }
    /**
     * Cập nhật lệnh sản xuất lưới thép hàn
     */
    updateMeshProduction(id, body, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingMeshProduction = yield this.repo.findOne({ id });
            if (!existingMeshProduction)
                return { id };
            const runTransaction = (tx) => __awaiter(this, void 0, void 0, function* () {
                const { type, add, update, delete: deleteIds, raw_materials_add, raw_materials_update, raw_materials_delete } = body, meshData = __rest(body, ["type", "add", "update", "delete", "raw_materials_add", "raw_materials_update", "raw_materials_delete"]);
                const mapData = this.autoMapConnection([meshData]);
                yield this.repo.update({ id }, mapData[0], tx);
                yield this.handleDetails(add, update, deleteIds, id, tx);
                yield this.handleRawMaterial(raw_materials_add, raw_materials_update, raw_materials_delete, id, tx);
                // Tính toán tổng số lượng, trọng lượng, diện tích (new)
                const meshProductionData = yield this.repo.findFirst({ id }, true, tx);
                const meshProductionDetailData = meshProductionData === null || meshProductionData === void 0 ? void 0 : meshProductionData.mesh_production_details;
                yield this.calculateAndUpdateTotal(meshProductionDetailData, id, tx);
            });
            if (tx) {
                yield runTransaction(tx);
            }
            else {
                yield this.db.$transaction(runTransaction);
            }
            return { id };
        });
    }
    /**
     * Cập nhật lệnh sản xuất lưới thép hàn
     */
    handleDetails(add, update, deleteIds, id, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (add && (add === null || add === void 0 ? void 0 : add.length) > 0) {
                yield this.validateForeignKeys(add, {
                    mesh_detail_id: this.meshDetailRepo,
                }, tx);
                const mapData = this.autoMapConnection(add, { mesh_id: id });
                yield this.meshProductionDetailService.createMany(mapData, tx);
            }
            if (update && (update === null || update === void 0 ? void 0 : update.length) > 0) {
                yield this.validateForeignKeys(update, {
                    mesh_detail_id: this.meshDetailRepo,
                }, tx);
                const mapData = this.autoMapConnection(update);
                yield this.meshProductionDetailService.updateMany(mapData, tx);
            }
            if (deleteIds && (deleteIds === null || deleteIds === void 0 ? void 0 : deleteIds.length) > 0) {
                yield this.meshProductionDetailService.deleteMany(deleteIds, tx);
            }
        });
    }
    /**
     * Xử lý nguyên liệu thô trong lệnh sản xuất lưới thép hàn
     */
    handleRawMaterial(add, update, deleteIds, id, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (add && (add === null || add === void 0 ? void 0 : add.length) > 0) {
                yield this.validateForeignKeys(add, {
                    product_id: this.productRepo,
                }, tx);
                const mapData = this.autoMapConnection(add, { mesh_id: id });
                yield this.rawMaterialService.createMany(mapData, tx);
            }
            if (update && (update === null || update === void 0 ? void 0 : update.length) > 0) {
                yield this.validateForeignKeys(update, {
                    product_id: this.productRepo,
                }, tx);
                const mapData = this.autoMapConnection(update);
                yield this.rawMaterialService.updateMany(mapData, tx);
            }
            if (deleteIds && (deleteIds === null || deleteIds === void 0 ? void 0 : deleteIds.length) > 0) {
                yield this.rawMaterialService.deleteMany(deleteIds, tx);
            }
        });
    }
    calculateAndUpdateTotal(data, id, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const meshDetail = yield this.meshDetailRepo.findMany({
                id: { in: data.map((item) => item.mesh_detail_id) },
            });
            const meshDetailData = meshDetail.map((item) => {
                const detail = data.find((d) => d.mesh_detail_id === item.id);
                return Object.assign(Object.assign({}, item), { quantity: (detail === null || detail === void 0 ? void 0 : detail.quantity) || 0 });
            });
            const dataCalculate = yield this.meshService.calculateTotal(id, meshDetailData, tx);
            yield this.repo.update({ id }, dataCalculate, tx);
        });
    }
}
exports.ProductionService = ProductionService;
