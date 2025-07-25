"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryDetailRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class InventoryDetailRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().inventoryDetails;
        this.defaultSelect = prisma_select_1.InventoryDetailSelection;
        this.detailSelect = prisma_select_1.InventoryDetailSelectionAll;
        this.modelKey = 'inventoryDetails';
    }
}
exports.InventoryDetailRepo = InventoryDetailRepo;
