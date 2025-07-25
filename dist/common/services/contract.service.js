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
exports.ContractService = void 0;
const base_service_1 = require("./master/base.service");
const contract_repo_1 = require("../repositories/contract.repo");
const common_detail_repo_1 = require("../repositories/common-detail.repo");
const product_repo_1 = require("../repositories/product.repo");
const employee_repo_1 = require("../repositories/employee.repo");
const organization_repo_1 = require("../repositories/organization.repo");
const partner_repo_1 = require("../repositories/partner.repo");
const app_constant_1 = require("../../config/app.constant");
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const unit_repo_1 = require("../repositories/unit.repo");
const transform_util_1 = require("../helpers/transform.util");
const order_repo_1 = require("../repositories/order.repo");
class ContractService extends base_service_1.BaseService {
    constructor() {
        super(new contract_repo_1.ContractRepo());
        this.contractDetailRepo = new common_detail_repo_1.CommonDetailRepo();
        this.partnerRepo = new partner_repo_1.PartnerRepo();
        this.orderRepo = new order_repo_1.OrderRepo();
        this.employeeRepo = new employee_repo_1.EmployeeRepo();
        this.organizationRepo = new organization_repo_1.OrganizationRepo();
        this.productRepo = new product_repo_1.ProductRepo();
        this.unitRepo = new unit_repo_1.UnitRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ContractService();
        }
        return this.instance;
    }
    createContract(request, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            let contractId = 0;
            yield this.isExist({ code: request.code });
            yield this.validateForeignKeys(request, {
                partner_id: this.partnerRepo,
                employee_id: this.employeeRepo,
                order_id: this.orderRepo,
                organization_id: this.organizationRepo,
            }, tx);
            const runTransaction = (transaction) => __awaiter(this, void 0, void 0, function* () {
                const { details } = request, contractData = __rest(request, ["details"]);
                contractId = yield this.repo.create(contractData, transaction);
                if (details && details.length > 0) {
                    yield this.validateForeignKeys(details, {
                        product_id: this.productRepo,
                        unit_id: this.unitRepo,
                    }, transaction);
                    const mappedDetails = details.map((item) => {
                        const { product_id, unit_id } = item, rest = __rest(item, ["product_id", "unit_id"]);
                        return Object.assign(Object.assign({}, rest), { contract: contractId ? { connect: { id: contractId } } : undefined, product: product_id ? { connect: { id: product_id } } : undefined, unit: unit_id ? { connect: { id: unit_id } } : undefined });
                    });
                    const filteredData = this.filterData(mappedDetails, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['details']);
                    yield this.contractDetailRepo.createMany(filteredData, transaction);
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
            return { id: contractId };
        });
    }
    updateContractEntity(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.findById(id);
            yield this.isExist({ code: request.code, id }, true);
            yield this.validateForeignKeys(request, {
                partner_id: this.partnerRepo,
                employee_id: this.employeeRepo,
                order_id: this.orderRepo,
                organization_id: this.organizationRepo,
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
                    add: this.mapDetails(request.add || [], { contract_id: id }),
                    update: this.mapDetails(request.update || [], { contract_id: id }),
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
                    yield this.updateChildEntity(filteredData, this.contractDetailRepo, tx);
                }
            }));
            return { id };
        });
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.repo.paginate(query, true);
            const data = this.enrichTotals(result);
            return (0, transform_util_1.transformDecimal)(data);
        });
    }
}
exports.ContractService = ContractService;
