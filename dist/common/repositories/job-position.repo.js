"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPositionRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class JobPositionRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().jobPositions;
        this.defaultSelect = prisma_select_1.JobPositionSelection;
        this.detailSelect = prisma_select_1.JobPositionSelectionAll;
        this.modelKey = 'jobPositions';
        this.searchableFields = {
            basic: [{ path: ['name'] }, { path: ['level'] }, { path: ['description'] }],
        };
    }
}
exports.JobPositionRepo = JobPositionRepo;
