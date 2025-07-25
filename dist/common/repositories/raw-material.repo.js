"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawMaterialRepo = void 0;
const prisma_select_1 = require("./prisma/prisma.select");
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
class RawMaterialRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().rawMaterials;
        this.defaultSelect = prisma_select_1.RawMaterialSelection;
        this.detailSelect = prisma_select_1.RawMaterialSelectionAll;
        this.modelKey = 'rawMaterials';
        this.timeFieldDefault = 'time_at';
        this.searchableFields = {
            basic: [],
        };
    }
}
exports.RawMaterialRepo = RawMaterialRepo;
