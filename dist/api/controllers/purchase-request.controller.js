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
exports.PurchaseRequestController = void 0;
const purchase_request_service_1 = require("../../common/services/purchase-request.service");
const base_controller_1 = require("./base.controller");
const logger_1 = __importDefault(require("../../common/logger"));
const app_constant_1 = require("../../config/app.constant");
class PurchaseRequestController extends base_controller_1.BaseController {
    constructor() {
        super(purchase_request_service_1.PurchaseRequestService.getInstance());
        this.service = purchase_request_service_1.PurchaseRequestService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PurchaseRequestController();
        }
        return this.instance;
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const result = yield this.service.createPurchaseRequest(body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.create: `, error);
                next(error);
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const id = Number(req.params.id);
                const result = yield this.service.updatePurchaseRequest(id, body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.update: `, error);
                next(error);
            }
        });
    }
    approve(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const id = Number(req.params.id);
                if (body.status === app_constant_1.PurchaseRequestStatus.CONFIRMED) {
                    body.rejected_reason = '';
                }
                const result = yield this.service.update(id, body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.approve: `, error);
                next(error);
            }
        });
    }
}
exports.PurchaseRequestController = PurchaseRequestController;
