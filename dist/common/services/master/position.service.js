"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionService = void 0;
const base_service_1 = require("./base.service");
const position_repo_1 = require("../../repositories/position.repo");
class PositionService extends base_service_1.BaseService {
    constructor() {
        super(new position_repo_1.PositionRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PositionService();
        }
        return this.instance;
    }
}
exports.PositionService = PositionService;
