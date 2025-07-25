"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClauseController = void 0;
const clause_service_1 = require("../../common/services/master/clause.service");
const base_controller_1 = require("./base.controller");
class ClauseController extends base_controller_1.BaseController {
    constructor() {
        super(clause_service_1.ClauseService.getInstance());
        this.service = clause_service_1.ClauseService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ClauseController();
        }
        return this.instance;
    }
}
exports.ClauseController = ClauseController;
