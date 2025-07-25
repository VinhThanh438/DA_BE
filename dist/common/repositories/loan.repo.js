"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class LoanRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().loans;
        this.defaultSelect = prisma_select_1.LoanSelection;
        this.detailSelect = prisma_select_1.LoanSelectionAll;
        this.modelKey = 'loans';
        this.timeFieldDefault = 'created_at';
        this.searchableFields = {
            basic: [{ path: ['account_number'] }, { path: ['bank', 'bank'] }],
        };
    }
}
exports.LoanRepo = LoanRepo;
