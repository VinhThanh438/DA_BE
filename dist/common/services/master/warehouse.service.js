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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseService = void 0;
const warehouse_repo_1 = require("../../repositories/warehouse.repo");
const base_service_1 = require("./base.service");
const employee_repo_1 = require("../../repositories/employee.repo");
class WarehouseService extends base_service_1.BaseService {
    constructor() {
        super(new warehouse_repo_1.WarehouseRepo());
        this.employeeRepo = new employee_repo_1.EmployeeRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new WarehouseService();
        }
        return this.instance;
    }
    create(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.isExist({ code: request.code });
            yield this.validateForeignKeys(request, {
                employee_id: this.employeeRepo,
            });
            const createdId = yield this.repo.create(request);
            return { id: createdId };
        });
    }
    update(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.isExist({ code: request.code, id }, true);
            yield this.validateForeignKeys(request, {
                employee_id: this.employeeRepo,
            });
            const updatedId = yield this.repo.update({ id }, request);
            return { id: updatedId };
        });
    }
}
exports.WarehouseService = WarehouseService;
