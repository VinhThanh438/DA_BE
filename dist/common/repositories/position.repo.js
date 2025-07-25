"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class PositionRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().positions;
        this.defaultSelect = prisma_select_1.PositionSelection;
        this.detailSelect = prisma_select_1.PositionSelectionAll;
        this.modelKey = 'positions';
    }
}
exports.PositionRepo = PositionRepo;
