"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebtRepo = void 0;
const base_repo_1 = require("./base.repo");
const database_adapter_1 = require("../infrastructure/database.adapter");
const prisma_select_1 = require("./prisma/prisma.select");
class DebtRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().debts;
        this.defaultSelect = prisma_select_1.DebtSelection;
        this.detailSelect = prisma_select_1.DebtSelectionAll;
        this.modelKey = 'debts';
    }
}
exports.DebtRepo = DebtRepo;
