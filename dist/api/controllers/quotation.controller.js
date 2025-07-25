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
exports.QuotationController = void 0;
const quotation_service_1 = require("../../common/services/quotation.service");
const app_constant_1 = require("../../config/app.constant");
const base_controller_1 = require("./base.controller");
const logger_1 = __importDefault(require("../../common/logger"));
class QuotationController extends base_controller_1.BaseController {
    constructor() {
        super(quotation_service_1.QuotationService.getInstance());
        this.service = quotation_service_1.QuotationService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new QuotationController();
        }
        return this.instance;
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const empId = Number(req.user.employee_id);
                let result;
                if (body.type === app_constant_1.QuotationType.CUSTOMER) {
                    result = yield this.service.createCustomerQuotation(empId, body);
                }
                else {
                    result = yield this.service.createSupplierQuotation(body);
                }
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
                const result = yield this.service.updateQuotation(id, body);
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
                const result = yield this.service.approve(id, body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.approve: `, error);
                next(error);
            }
        });
    }
}
exports.QuotationController = QuotationController;
