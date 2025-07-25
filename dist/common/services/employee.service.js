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
exports.EmployeeService = void 0;
const employee_repo_1 = require("../repositories/employee.repo");
const job_position_repo_1 = require("../repositories/job-position.repo");
const base_service_1 = require("./master/base.service");
const organization_repo_1 = require("../repositories/organization.repo");
const app_constant_1 = require("../../config/app.constant");
const employee_contract_repo_1 = require("../repositories/employee-contract.repo");
const employee_finance_repo_1 = require("../repositories/employee-finance.repo");
class EmployeeService extends base_service_1.BaseService {
    constructor() {
        super(new employee_repo_1.EmployeeRepo());
        this.jobPositionRepo = new job_position_repo_1.JobPositionRepo();
        this.organizationRepo = new organization_repo_1.OrganizationRepo();
        this.employeeContractRepo = new employee_contract_repo_1.EmployeeContractRepo();
        this.employeeFinanceRepo = new employee_finance_repo_1.EmployeeFinanceRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new EmployeeService();
        }
        return this.instance;
    }
    updateEmployee(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.findById(id);
            yield this.isExistIncludeConditions({
                code: request.code,
                attendance_code: request.attendance_code,
                identity_code: request.identity_code,
                passport_code: request.passport_code,
                id,
            }, true);
            yield this.validateForeignKeys(request, {
                organization_id: this.organizationRepo,
                job_position_id: this.jobPositionRepo,
            });
            const { employee_contracts_add = [], employee_contracts_update = [], employee_contracts_delete = [], employee_finances_add = [], employee_finances_update = [], employee_finances_delete = [] } = request, body = __rest(request, ["employee_contracts_add", "employee_contracts_update", "employee_contracts_delete", "employee_finances_add", "employee_finances_update", "employee_finances_delete"]);
            if (employee_finances_add.length > 0) {
                employee_finances_add.forEach((item) => {
                    Object.assign(item, { employee: { connect: { id } } });
                });
            }
            if (employee_contracts_add.length > 0) {
                employee_contracts_add.forEach((item) => {
                    Object.assign(item, { employee: { connect: { id } } });
                });
            }
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield this.updateChildEntity({ add: employee_finances_add, update: employee_finances_update, delete: employee_finances_delete }, this.employeeFinanceRepo, tx);
                yield this.updateChildEntity({ add: employee_contracts_add, update: employee_contracts_update, delete: employee_contracts_delete }, this.employeeContractRepo, tx);
                yield this.repo.update({ id }, body, tx);
            }));
            return { id };
        });
    }
    create(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.isExist({
                code: request.code,
                attendance_code: request.attendance_code,
                identity_code: request.identity_code,
                passport_code: request.passport_code,
                email: request.email,
                phone: request.phone,
            });
            yield this.validateForeignKeys(request, {
                organization_id: this.organizationRepo,
                job_position_id: this.jobPositionRepo,
            });
            if (request.employee_contracts && request.employee_contracts.length > 0) {
                request.employee_contracts = this.filterData(request.employee_contracts, app_constant_1.DEFAULT_EXCLUDED_FIELDS, [
                    'employee_contracts',
                ]);
            }
            if (request.employee_finances && request.employee_finances.length > 0) {
                request.employee_finances = this.filterData(request.employee_finances, app_constant_1.DEFAULT_EXCLUDED_FIELDS, [
                    'employee_finances',
                ]);
            }
            if (request.insurances && request.insurances.length > 0) {
                request.insurances = this.filterData(request.insurances, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['insurances']);
            }
            if (request.addresses && request.addresses.length > 0) {
                request.addresses = this.filterData(request.addresses, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['addresses']);
            }
            const data = yield this.repo.create(request);
            return { id: data };
        });
    }
}
exports.EmployeeService = EmployeeService;
