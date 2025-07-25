"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class CommissionRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().commissions;
        this.defaultSelect = prisma_select_1.CommissionSelection;
        this.detailSelect = prisma_select_1.CommissionSelectionAll;
        this.timeFieldDefault = 'created_at';
        this.modelKey = 'commissions';
        this.searchableFields = {
            basic: [],
        };
    }
}
exports.CommissionRepo = CommissionRepo;
