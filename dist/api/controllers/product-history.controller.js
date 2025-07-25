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
exports.ProductHistoryController = void 0;
const product_history_service_1 = require("../../common/services/master/product-history.service");
const base_controller_1 = require("./base.controller");
const logger_1 = __importDefault(require("../../common/logger"));
class ProductHistoryController extends base_controller_1.BaseController {
    constructor() {
        super(product_history_service_1.ProductHistoryService.getInstance());
        this.service = product_history_service_1.ProductHistoryService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProductHistoryController();
        }
        return this.instance;
    }
    paginate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = req.query;
                delete query.OR;
                query.product_id = query.productIds ? { in: query.productIds.split(',').map(Number) } : undefined;
                const data = yield this.service.paginate(query);
                res.sendJson(data);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.paginate: `, error);
                next(error);
            }
        });
    }
}
exports.ProductHistoryController = ProductHistoryController;
