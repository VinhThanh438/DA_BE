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
exports.ProductController = void 0;
const product_service_1 = require("../../common/services/product.service");
const base_controller_1 = require("./base.controller");
const logger_1 = __importDefault(require("../../common/logger"));
class ProductController extends base_controller_1.BaseController {
    constructor() {
        super(product_service_1.ProductService.getInstance());
        this.service = product_service_1.ProductService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProductController();
        }
        return this.instance;
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const output = yield this.service.createProduct(body);
                res.sendJson(output);
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
                const { id } = req.params;
                const output = yield this.service.updateProduct(Number(id), body);
                res.sendJson(output);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.update: `, error);
                next(error);
            }
        });
    }
    search(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const output = yield this.service.search(Object.assign(Object.assign({}, req.query), { isPublic: true }));
                res.sendJson(output);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.search: `, error);
                next(error);
            }
        });
    }
}
exports.ProductController = ProductController;
