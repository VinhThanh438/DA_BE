"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class InventoryRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().inventories;
        this.defaultSelect = prisma_select_1.InventorySelection;
        this.detailSelect = prisma_select_1.InventorySelectionAll;
        this.modelKey = 'inventories';
        this.timeFieldDefault = 'time_at';
        // protected searchableFields = ['code'];
        this.searchableFields = {
            basic: [
                { path: ['code'] },
                { path: ['order', 'code'] },
                // { path: ['order_details', 'po'], isArray: true },
            ],
        };
    }
}
exports.InventoryRepo = InventoryRepo;
