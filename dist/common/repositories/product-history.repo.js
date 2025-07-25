"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductHistoryRepo = void 0;
const base_repo_1 = require("./base.repo");
const database_adapter_1 = require("../infrastructure/database.adapter");
const prisma_select_1 = require("./prisma/prisma.select");
class ProductHistoryRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().productHistories;
        this.defaultSelect = prisma_select_1.ProductHistorySelection;
        this.detailSelect = prisma_select_1.ProductHistorySelectionAll;
        this.modelKey = 'productHistories';
    }
}
exports.ProductHistoryRepo = ProductHistoryRepo;
