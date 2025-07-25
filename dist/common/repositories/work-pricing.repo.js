"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkPricingRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class WorkPricingRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().workPricings;
        this.defaultSelect = prisma_select_1.WorkPricingSelection;
        this.detailSelect = prisma_select_1.WorkPricingSelectionAll;
        this.modelKey = 'workPricings';
    }
}
exports.WorkPricingRepo = WorkPricingRepo;
