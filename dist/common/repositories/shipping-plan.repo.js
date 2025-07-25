"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingPlanRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class ShippingPlanRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().shippingPlans;
        this.defaultSelect = prisma_select_1.ShippingPlanSelection;
        this.detailSelect = prisma_select_1.ShippingPlanSelectionAll;
        this.modelKey = 'shippingPlans';
    }
}
exports.ShippingPlanRepo = ShippingPlanRepo;
