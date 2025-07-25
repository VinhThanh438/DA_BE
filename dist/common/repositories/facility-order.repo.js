"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityOrderRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class FacilityOrderRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().facilityOrders;
        this.defaultSelect = prisma_select_1.FacilityOrderSelection;
        this.detailSelect = prisma_select_1.FacilityOrderSelectionAll;
        this.modelKey = 'facilityOrders';
        this.timeFieldDefault = 'created_at';
    }
}
exports.FacilityOrderRepo = FacilityOrderRepo;
