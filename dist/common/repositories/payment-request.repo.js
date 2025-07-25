"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRequestRepo = void 0;
const base_repo_1 = require("./base.repo");
const database_adapter_1 = require("../infrastructure/database.adapter");
const prisma_select_1 = require("./prisma/prisma.select");
class PaymentRequestRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().paymentRequests;
        this.defaultSelect = prisma_select_1.PaymentRequestSelectAll;
        this.detailSelect = prisma_select_1.PaymentRequestSelectAll;
        this.modelKey = 'paymentRequests';
        this.searchableFields = {
            basic: [
                { path: ['code'] },
                { path: ['partner', 'name'] },
                { path: ['details', 'invoice', 'code'], isArray: true },
            ],
        };
    }
}
exports.PaymentRequestRepo = PaymentRequestRepo;
