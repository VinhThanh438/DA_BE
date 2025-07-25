"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshProductionDetailsRepo = exports.ProductionRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class ProductionRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().productions;
        this.defaultSelect = prisma_select_1.ProductionSelection;
        this.detailSelect = prisma_select_1.ProductionSelectionAll;
        this.modelKey = 'productions';
        this.timeFieldDefault = 'time_at';
        this.searchableFields = {
            basic: [{ path: ['code'] }],
        };
    }
}
exports.ProductionRepo = ProductionRepo;
class MeshProductionDetailsRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().meshProductionDetails;
        this.defaultSelect = prisma_select_1.MeshProductionDetailSelection;
        this.detailSelect = prisma_select_1.MeshProductionDetailSelectionAll;
        this.modelKey = 'meshProductionDetails';
        this.timeFieldDefault = 'time_at';
        this.searchableFields = {
            basic: [],
        };
    }
}
exports.MeshProductionDetailsRepo = MeshProductionDetailsRepo;
