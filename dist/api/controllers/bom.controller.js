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
exports.BomController = void 0;
const bom_service_1 = require("../../common/services/bom.service");
const base_controller_1 = require("./base.controller");
const logger_1 = __importDefault(require("../../common/logger"));
class BomController extends base_controller_1.BaseController {
    constructor() {
        super(bom_service_1.BomService.getInstance());
        this.service = bom_service_1.BomService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new BomController();
        }
        return this.instance;
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const result = yield this.service.createBom(body);
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
                const id = Number(req.params.id);
                const body = req.body;
                const result = yield this.service.updateBom(id, body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.update: `, error);
                next(error);
            }
        });
    }
    getMaterialEstimation(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const output = yield this.service.getMaterialEstimation(req.query);
                res.sendJson(output);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.getMaterialEstimation: `, error);
                next(error);
            }
        });
    }
}
exports.BomController = BomController;
