"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class MeshRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().mesh;
        this.defaultSelect = prisma_select_1.MeshSelection;
        this.detailSelect = prisma_select_1.MeshSelectionAll;
        this.modelKey = 'mesh';
        this.timeFieldDefault = 'created_at';
        this.searchableFields = {
            basic: [],
        };
    }
}
exports.MeshRepo = MeshRepo;
