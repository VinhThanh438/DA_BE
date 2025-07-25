"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class WarehouseRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().warehouses;
        this.defaultSelect = prisma_select_1.WarehouseSelection;
        this.detailSelect = prisma_select_1.WarehouseSelectionAll;
        this.modelKey = 'warehouses';
        this.searchableFields = {
            basic: [{ path: ['name'] }, { path: ['code'] }, { path: ['note'] }, { path: ['phone'] }],
        };
    }
}
exports.WarehouseRepo = WarehouseRepo;
