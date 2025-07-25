"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class OrganizationRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().organizations;
        this.defaultSelect = prisma_select_1.OrganizationSelection;
        this.detailSelect = prisma_select_1.OrganizationSelectionAll;
        this.modelKey = 'organizations';
        this.searchableFields = {
            basic: [{ path: ['name'] }, { path: ['code'] }],
        };
    }
}
exports.OrganizationRepo = OrganizationRepo;
