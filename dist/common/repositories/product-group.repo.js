"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductGroupRepo = void 0;
const base_repo_1 = require("./base.repo");
const database_adapter_1 = require("../infrastructure/database.adapter");
const prisma_select_1 = require("./prisma/prisma.select");
class ProductGroupRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().productGroups;
        this.defaultSelect = prisma_select_1.ProductGroupSelection;
        this.detailSelect = prisma_select_1.ProductGroupSelectionAll;
        this.modelKey = 'productGroups';
    }
}
exports.ProductGroupRepo = ProductGroupRepo;
