"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class FacilityRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().facility;
        this.defaultSelect = prisma_select_1.FacilitySelection;
        this.detailSelect = prisma_select_1.FacilitySelectionAll;
        this.modelKey = 'facility';
        this.timeFieldDefault = 'created_at';
        this.searchableFields = {
            basic: [{ path: ['name'] }, { path: ['code'] }],
        };
    }
}
exports.FacilityRepo = FacilityRepo;
