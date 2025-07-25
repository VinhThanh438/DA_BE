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
exports.StockTrackingEvent = void 0;
const logger_1 = __importDefault(require("../logger"));
const stock_tracking_service_1 = require("../services/master/stock-tracking.service");
class StockTrackingEvent {
    static register() {
        this.stockTrackingService = stock_tracking_service_1.StockTrackingService.getInstance();
        // eventbus.on(EVENT_INVENTORY_APPROVED, this.inventoryCreatedHandler.bind(this));
    }
    static inventoryCreatedHandler(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.stockTrackingService.createMany(body);
                logger_1.default.info('StockTrackingEvent.inventoryCreatedHandler: StockTracking created/updated successfully!');
            }
            catch (error) {
                logger_1.default.error('StockTrackingEvent.inventoryCreatedHandler:', error);
            }
        });
    }
}
exports.StockTrackingEvent = StockTrackingEvent;
