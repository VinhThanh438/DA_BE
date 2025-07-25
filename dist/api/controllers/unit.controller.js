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
exports.UnitController = void 0;
const logger_1 = __importDefault(require("../../common/logger"));
const unit_service_1 = require("../../common/services/master/unit.service");
class UnitController {
    constructor() {
        this.service = unit_service_1.UnitService.getInstance();
    }
    static getInstance() {
        if (!this.controller) {
            this.controller = new UnitController();
        }
        return this.controller;
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const input = req.body;
                const output = yield this.service.create(input);
                res.sendJson(output);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.create: `, error);
                next(error);
            }
        });
    }
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const input = req.query;
                const output = yield this.service.getAll(input);
                res.sendJson(output);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.getAll: `, error);
                next(error);
            }
        });
    }
    getById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const output = yield this.service.getById(Number(id));
                res.sendJson(output);
            }
            catch (error) {
                next(error);
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const body = req.body;
                const output = yield this.service.update(Number(id), body);
                res.sendJson(output);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.update: `, error);
                next(error);
            }
        });
    }
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const output = yield this.service.delete(Number(id));
                res.sendJson(output);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.delete: `, error);
                next(error);
            }
        });
    }
}
exports.UnitController = UnitController;
