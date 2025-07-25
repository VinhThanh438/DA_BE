"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterestLogController = void 0;
const interest_log_service_1 = require("../../common/services/interest-log.service");
const base_controller_1 = require("./base.controller");
class InterestLogController extends base_controller_1.BaseController {
    constructor() {
        super(interest_log_service_1.InterestLogService.getInstance());
        this.service = interest_log_service_1.InterestLogService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new InterestLogController();
        }
        return this.instance;
    }
}
exports.InterestLogController = InterestLogController;
