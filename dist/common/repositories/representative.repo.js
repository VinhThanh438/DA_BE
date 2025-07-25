"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepresentativeRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class RepresentativeRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().representatives;
        this.defaultSelect = prisma_select_1.RepresentativeSelection;
        this.detailSelect = prisma_select_1.RepresentativeSelectionAll;
        this.modelKey = 'representatives';
    }
}
exports.RepresentativeRepo = RepresentativeRepo;
