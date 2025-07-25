"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyContactRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class EmergencyContactRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().emergencyContacts;
        this.defaultSelect = prisma_select_1.EmergencyContactSelection;
        this.detailSelect = prisma_select_1.EmergencyContactSelectionAll;
        this.modelKey = 'emergencyContacts';
    }
}
exports.EmergencyContactRepo = EmergencyContactRepo;
