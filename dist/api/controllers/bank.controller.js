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
exports.BankController = void 0;
const base_controller_1 = require("./base.controller");
const logger_1 = __importDefault(require("../../common/logger"));
const bank_service_1 = require("../../common/services/bank.service");
class BankController extends base_controller_1.BaseController {
    constructor() {
        super(bank_service_1.BankService.getInstance());
        this.service = bank_service_1.BankService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new BankController();
        }
        return this.instance;
    }
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.partnerId) {
                    req.query.partner_id = null;
                    req.query.representative_id = null;
                }
                else {
                    req.query.partner_id = req.query.partnerId;
                    delete req.query.partnerId;
                }
                const _a = req.query, { page, size, startAt, endAt, keyword } = _a, query = __rest(_a, ["page", "size", "startAt", "endAt", "keyword"]);
                let result;
                if (page || size || (startAt && endAt)) {
                    result = yield this.service.paginate(req.query);
                }
                else {
                    result = yield this.service.getAll(query);
                }
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.getAll: `, error);
                next(error);
            }
        });
    }
    transfer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const result = yield this.service.transfer(body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.transfer: `, error);
                next(error);
            }
        });
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const result = yield this.service.createBank(body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.create: `, error);
                next(error);
            }
        });
    }
    getFundBalanceById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bankId = Number(req.params.id);
                const { startAt, endAt } = req.query;
                const result = yield this.service.getFundBalanceById(bankId, startAt, endAt);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.getFundBalanceById: `, error);
                next(error);
            }
        });
    }
}
exports.BankController = BankController;
