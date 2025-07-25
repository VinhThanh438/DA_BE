"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankRepo = void 0;
const base_repo_1 = require("./base.repo");
const database_adapter_1 = require("../infrastructure/database.adapter");
const prisma_select_1 = require("./prisma/prisma.select");
class BankRepo extends base_repo_1.BaseRepo {
    constructor() {
        super();
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().banks;
        this.defaultSelect = prisma_select_1.BankSelection;
        this.detailSelect = prisma_select_1.BankSelectionAll;
        this.modelKey = 'banks';
    }
}
exports.BankRepo = BankRepo;
