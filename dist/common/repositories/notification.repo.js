"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class NotificationRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().notifications;
        this.defaultSelect = prisma_select_1.NotificationSelection;
        this.detailSelect = prisma_select_1.NotificationSelectionAll;
        this.modelKey = 'notifications';
        this.timeFieldDefault = 'created_at';
    }
}
exports.NotificationRepo = NotificationRepo;
