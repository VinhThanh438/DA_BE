"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepo = void 0;
const base_repo_1 = require("./base.repo");
const database_adapter_1 = require("../infrastructure/database.adapter");
const prisma_select_1 = require("./prisma/prisma.select");
class PaymentRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().payments;
        this.defaultSelect = prisma_select_1.PaymentSelect;
        this.detailSelect = prisma_select_1.PaymentSelectAll;
        this.modelKey = 'payments';
        this.timeFieldDefault = 'time_at';
        this.searchableFields = {
            basic: [{ path: ['code'] }],
        };
    }
}
exports.PaymentRepo = PaymentRepo;
