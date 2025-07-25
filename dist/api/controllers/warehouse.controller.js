"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseController = void 0;
const base_controller_1 = require("./base.controller");
const warehouse_service_1 = require("../../common/services/master/warehouse.service");
class WarehouseController extends base_controller_1.BaseController {
    constructor() {
        super(warehouse_service_1.WarehouseService.getInstance());
        this.service = warehouse_service_1.WarehouseService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new WarehouseController();
        }
        return this.instance;
    }
}
exports.WarehouseController = WarehouseController;
