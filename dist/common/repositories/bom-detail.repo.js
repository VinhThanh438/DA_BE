"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BomDetailRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class BomDetailRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().bomDetails;
        this.defaultSelect = prisma_select_1.BomDetailSelection;
        this.detailSelect = prisma_select_1.BomDetailSelectionAll;
        this.modelKey = 'bomDetails';
    }
}
exports.BomDetailRepo = BomDetailRepo;
