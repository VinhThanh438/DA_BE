"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterestLogService = void 0;
const interest_log_repo_1 = require("../repositories/interest-log.repo");
const base_service_1 = require("./master/base.service");
class InterestLogService extends base_service_1.BaseService {
    constructor() {
        super(new interest_log_repo_1.InterestLogRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new InterestLogService();
        }
        return this.instance;
    }
}
exports.InterestLogService = InterestLogService;
