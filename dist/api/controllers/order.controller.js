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
exports.OrderController = void 0;
const base_controller_1 = require("./base.controller");
const logger_1 = __importDefault(require("../../common/logger"));
const order_service_1 = require("../../common/services/order.service");
class OrderController extends base_controller_1.BaseController {
    constructor() {
        super(order_service_1.OrderService.getInstance());
        this.service = order_service_1.OrderService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new OrderController();
        }
        return this.instance;
    }
    approve(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const id = Number(req.params.id);
                const result = yield this.service.approve(id, body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.approveRequest: `, error);
                next(error);
            }
        });
    }
    updateOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const id = Number(req.params.id);
                const result = yield this.service.updateOrder(id, body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.updateOrderRequest: `, error);
                next(error);
            }
        });
    }
    approveShippingPlan(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const id = Number(req.params.id);
                const result = yield this.service.approveShippingPlan(id, body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.approveShippingPlanRequest: `, error);
                next(error);
            }
        });
    }
    getPurchaseProcessing(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const result = yield this.service.getPurchaseProcessing(id);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.getPurchaseProcessingRequest: `, error);
                next(error);
            }
        });
    }
}
exports.OrderController = OrderController;
