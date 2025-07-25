"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryEvent = void 0;
const eventbus_1 = __importDefault(require("../eventbus"));
const time_adapter_1 = require("../infrastructure/time.adapter");
const logger_1 = __importDefault(require("../logger"));
const common_detail_repo_1 = require("../repositories/common-detail.repo");
const gate_log_repo_1 = require("../repositories/gate-log.repo");
const inventory_repo_1 = require("../repositories/inventory.repo");
const app_constant_1 = require("../../config/app.constant");
const event_constant_1 = require("../../config/event.constant");
class InventoryEvent {
    static register() {
        this.gateLogRepo = new gate_log_repo_1.GateLogRepo();
        this.orderDetailRepo = new common_detail_repo_1.CommonDetailRepo();
        this.inventoryRepo = new inventory_repo_1.InventoryRepo();
        eventbus_1.default.on(event_constant_1.EVENT_INVENTORY_APPROVED, this.inventoryCreatedHandler.bind(this));
        eventbus_1.default.on(event_constant_1.EVENT_ORDER_IMPORT_QUANTITY, this.updateImportQuantityHandler.bind(this));
        eventbus_1.default.on(event_constant_1.EVENT_CREATE_GATELOG, this.gateLogCreatedHandler.bind(this));
        eventbus_1.default.on(event_constant_1.EVENT_DISABLE_UPDATE_INVENTORY, this.disableUpdateInventoryHandler.bind(this));
    }
    static disableUpdateInventoryHandler(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = data;
                yield this.inventoryRepo.update({ id }, { is_update_locked: true });
                logger_1.default.info('InventoryEvent.disableUpdateInventoryHandler: Successfully!');
            }
            catch (error) {
                logger_1.default.error('InventoryEvent.disableUpdateInventoryHandler:', error);
            }
        });
    }
    static inventoryCreatedHandler(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (body.status && body.status === app_constant_1.CommonApproveStatus.CONFIRMED) {
                    yield this.inventoryRepo.update({ id: body.id }, { confirmed_at: time_adapter_1.TimeAdapter.currentDate() });
                    logger_1.default.info('InventoryEvent.inventoryCreatedHandler: updated successfully!');
                }
            }
            catch (error) {
                logger_1.default.error('InventoryEvent.inventoryCreatedHandler:', error);
            }
        });
    }
    static updateImportQuantityHandler(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dataToUpdate = [];
                for (const [key, value] of Object.entries(data)) {
                    dataToUpdate.push({ id: Number(key), imported_quantity: value });
                }
                yield this.orderDetailRepo.updateMany(dataToUpdate);
                logger_1.default.info('InventoryEvent.updateImportQuantityHandler: Successfully!');
            }
            catch (error) {
                logger_1.default.error('InventoryEvent.updateImportQuantityHandler:', error);
            }
        });
    }
    static gateLogCreatedHandler(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.gateLogRepo.create(data);
                logger_1.default.info('InventoryEvent.gateLogCreatedHandler: Successfully!');
            }
            catch (error) {
                logger_1.default.error('InventoryEvent.gateLogCreatedHandler:', error);
            }
        });
    }
}
exports.InventoryEvent = InventoryEvent;
