"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeFinanceRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class EmployeeFinanceRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().employeeFinances;
        this.defaultSelect = prisma_select_1.EmployeeFinanceSelection;
        this.detailSelect = prisma_select_1.EmployeeFinanceSelectionAll;
        this.modelKey = 'employeeFinances';
    }
}
exports.EmployeeFinanceRepo = EmployeeFinanceRepo;
