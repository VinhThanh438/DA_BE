"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClauseRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class ClauseRepo extends base_repo_1.BaseRepo {
    constructor() {
        super();
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().clauses;
        this.defaultSelect = prisma_select_1.ClauseSelection;
        this.detailSelect = prisma_select_1.ClauseSelectionAll;
        this.searchableFields = {
            basic: [{ path: ['name'] }],
        };
        this.modelKey = 'clauses';
    }
}
exports.ClauseRepo = ClauseRepo;
