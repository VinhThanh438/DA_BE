"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerGroupService = void 0;
const partner_group_repo_1 = require("../repositories/partner-group.repo");
const base_service_1 = require("./master/base.service");
class PartnerGroupService extends base_service_1.BaseService {
    constructor() {
        super(new partner_group_repo_1.PartnerGroupRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PartnerGroupService();
        }
        return this.instance;
    }
}
exports.PartnerGroupService = PartnerGroupService;
