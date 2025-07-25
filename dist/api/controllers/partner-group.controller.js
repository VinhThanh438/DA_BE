"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerGroupController = void 0;
const partner_group_service_1 = require("../../common/services/partner-group.service");
const base_controller_1 = require("./base.controller");
class PartnerGroupController extends base_controller_1.BaseController {
    constructor() {
        super(partner_group_service_1.PartnerGroupService.getInstance());
        this.service = partner_group_service_1.PartnerGroupService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PartnerGroupController();
        }
        return this.instance;
    }
}
exports.PartnerGroupController = PartnerGroupController;
