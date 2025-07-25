"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceDetailRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class InvoiceDetailRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().invoiceDetails;
        this.defaultSelect = prisma_select_1.InvoiceDetailSelection;
        this.detailSelect = prisma_select_1.InvoiceDetailSelectionAll;
        this.modelKey = 'invoiceDetails';
    }
}
exports.InvoiceDetailRepo = InvoiceDetailRepo;
