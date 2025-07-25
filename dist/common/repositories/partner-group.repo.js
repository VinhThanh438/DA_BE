"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerGroupRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class PartnerGroupRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().partnerGroups;
        this.defaultSelect = prisma_select_1.PartnerGroupSelection;
        this.detailSelect = prisma_select_1.PartnerGroupSelectionAll;
        this.modelKey = 'partnerGroups';
    }
}
exports.PartnerGroupRepo = PartnerGroupRepo;
