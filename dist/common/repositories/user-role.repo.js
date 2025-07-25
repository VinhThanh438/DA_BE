"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoleRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
class UserRoleRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().userRoles;
        this.defaultSelect = {};
        this.detailSelect = {};
        this.modelKey = 'userRoles';
    }
}
exports.UserRoleRepo = UserRoleRepo;
