"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionController = void 0;
const position_service_1 = require("../../common/services/master/position.service");
const base_controller_1 = require("./base.controller");
class PositionController extends base_controller_1.BaseController {
    constructor() {
        super(position_service_1.PositionService.getInstance());
        this.service = position_service_1.PositionService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PositionController();
        }
        return this.instance;
    }
}
exports.PositionController = PositionController;
