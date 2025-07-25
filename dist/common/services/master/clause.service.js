"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClauseService = void 0;
const clause_repo_1 = require("../../repositories/clause.repo");
const base_service_1 = require("./base.service");
class ClauseService extends base_service_1.BaseService {
    constructor() {
        super(new clause_repo_1.ClauseRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ClauseService();
        }
        return this.instance;
    }
}
exports.ClauseService = ClauseService;
