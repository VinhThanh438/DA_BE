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
exports.ProductEvent = void 0;
const eventbus_1 = __importDefault(require("../eventbus"));
const logger_1 = __importDefault(require("../logger"));
const product_history_repo_1 = require("../repositories/product-history.repo");
const event_constant_1 = require("../../config/event.constant");
class ProductEvent {
    static register() {
        this.productHistoryRepo = new product_history_repo_1.ProductHistoryRepo();
        eventbus_1.default.on(event_constant_1.EVENT_PRODUCT_HISTORY_UPDATED, this.productHistoryUpdatedHandler.bind(this));
    }
    static productHistoryUpdatedHandler(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.productHistoryRepo.create({
                    product_id: body.id,
                    price: body.current_price,
                });
                logger_1.default.info('ProductEvent.productHistoryUpdatedHandler: product history created successfully!');
            }
            catch (error) {
                logger_1.default.error('ProductEvent.productHistoryUpdatedHandler:', error);
            }
        });
    }
}
exports.ProductEvent = ProductEvent;
