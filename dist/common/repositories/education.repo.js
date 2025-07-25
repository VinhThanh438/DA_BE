"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class EducationRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().educations;
        this.defaultSelect = prisma_select_1.EducationSelection;
        this.detailSelect = prisma_select_1.EducationSelectionAll;
        this.modelKey = 'educations';
    }
}
exports.EducationRepo = EducationRepo;
