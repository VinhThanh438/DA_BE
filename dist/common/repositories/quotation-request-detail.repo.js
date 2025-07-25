"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationRequestDetailRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class QuotationRequestDetailRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().quotationRequestDetails;
        this.defaultSelect = prisma_select_1.QuotationRequestDetailSelection;
        this.detailSelect = prisma_select_1.QuotationRequestDetailSelectionAll;
        this.modelKey = 'quotationRequestDetails';
        this.searchableFields = {
            basic: [{ path: ['product', 'name'] }, { path: ['note'] }],
        };
    }
}
exports.QuotationRequestDetailRepo = QuotationRequestDetailRepo;
