"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepo = void 0;
const base_repo_1 = require("./base.repo");
const database_adapter_1 = require("../infrastructure/database.adapter");
const prisma_select_1 = require("./prisma/prisma.select");
class TransactionRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().transactions;
        this.defaultSelect = prisma_select_1.TransactionSelect;
        this.detailSelect = prisma_select_1.TransactionSelectAll;
        this.modelKey = 'transactions';
        this.timeFieldDefault = 'time_at';
    }
}
exports.TransactionRepo = TransactionRepo;
