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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionController = void 0;
const production_service_1 = require("../../common/services/production/production.service");
const app_constant_1 = require("../../config/app.constant");
const base_controller_1 = require("./base.controller");
const logger_1 = __importDefault(require("../../common/logger"));
class ProductionController extends base_controller_1.BaseController {
    constructor() {
        super(production_service_1.ProductionService.getInstance());
        this.service = production_service_1.ProductionService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProductionController();
        }
        return this.instance;
    }
    paginate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = req.query, { type } = _a, filter = __rest(_a, ["type"]);
                let result = null;
                if (type === 'mesh') {
                    result = yield this.service.paginate(filter);
                }
                else {
                    result = yield this.service.paginate(filter);
                }
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.paginate: `, error);
                next(error);
            }
        });
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                let result = null;
                if (body.type === app_constant_1.ProductionType.MESH) {
                    result = yield this.service.createMeshProduction(body);
                }
                else {
                    result = yield this.service.create(body);
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
                let result = null;
                if (body.type === app_constant_1.ProductionType.MESH) {
                    result = yield this.service.updateMeshProduction(id, body);
                }
                else {
                    result = yield this.service.updateProduction(id, body);
                }
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.update: `, error);
                next(error);
            }
        });
    }
}
exports.ProductionController = ProductionController;
