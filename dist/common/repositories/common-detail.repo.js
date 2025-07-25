"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonDetailRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class CommonDetailRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().commonDetails;
        this.defaultSelect = prisma_select_1.CommonDetailSelection;
        this.detailSelect = prisma_select_1.CommonDetailSelectionAll;
        this.modelKey = 'commonDetails';
    }
}
exports.CommonDetailRepo = CommonDetailRepo;
