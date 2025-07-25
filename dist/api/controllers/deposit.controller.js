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
exports.DepositController = void 0;
const base_controller_1 = require("./base.controller");
const deposit_service_1 = require("../../common/services/deposit.service");
const logger_1 = __importDefault(require("../../common/logger"));
class DepositController extends base_controller_1.BaseController {
    constructor() {
        super(deposit_service_1.DepositService.getInstance());
        this.service = deposit_service_1.DepositService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new DepositController();
        }
        return this.instance;
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const uId = req.user.id;
                const eId = req.user.employee_id;
                const result = yield this.service.createDeposit(body, uId, eId);
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
                const id = parseInt(req.params.id);
                const result = yield this.service.updateDeposit(id, body);
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
                const id = parseInt(req.params.id);
                const result = yield this.service.approve(id, body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.approve: `, error);
                next(error);
            }
        });
    }
    settlement(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const id = parseInt(req.params.id);
                const isAdmin = Boolean(req.user.isAdmin) || false;
                const result = yield this.service.settlement(id, body, isAdmin);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.settlement: `, error);
                next(error);
            }
        });
    }
    paginate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.service.paginates(req.query);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.paginate: `, error);
                next(error);
            }
        });
    }
}
exports.DepositController = DepositController;
