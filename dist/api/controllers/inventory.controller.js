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
exports.InventoryController = void 0;
const base_controller_1 = require("./base.controller");
const logger_1 = __importDefault(require("../../common/logger"));
const inventory_service_1 = require("../../common/services/inventory.service");
const errors_1 = require("../../common/errors");
class InventoryController extends base_controller_1.BaseController {
    constructor() {
        super(inventory_service_1.InventoryService.getInstance());
        this.service = inventory_service_1.InventoryService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new InventoryController();
        }
        return this.instance;
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const result = yield this.service.createInventory(body);
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
                const isAdmin = Boolean(req.user.isAdmin) || false;
                const data = yield this.service.updateInventory(id, body, isAdmin);
                res.sendJson(data);
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
                logger_1.default.error(`${this.constructor.name}.approveRequest: `, error);
                next(error);
            }
        });
    }
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const isAdmin = Boolean(req.user.isAdmin) || false;
                const data = yield this.service.deleteInventory(id, isAdmin);
                res.sendJson(data);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.delete: `, error);
                next(error);
            }
        });
    }
    getInventoryReport(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = req.query;
                const { data, summary } = yield this.service.getInventoryReport(query);
                // res.sendJson(data);
                res.status(200).json({
                    errorCode: 0,
                    statusCode: errors_1.StatusCode.SUCCESS,
                    message: 'OK',
                    data,
                    // pagination: (data as { pagination: object }).pagination,
                    summary,
                });
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.getInventoryReport: `, error);
                next(error);
            }
        });
    }
    getInventoryReportDetail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = req.query;
                const data = yield this.service.getInventoryReportDetail(query);
                res.sendJson(data);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.getInventoryReportDetail: `, error);
                next(error);
            }
        });
    }
    getInventoryImportDetail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = req.query;
                const result = yield this.service.getInventoryImportDetail(query);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.getInventoryImportDetail: `, error);
                next(error);
            }
        });
    }
    different(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = req.query;
                const data = yield this.service.different(query);
                res.sendJson(data);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.different: `, error);
                next(error);
            }
        });
    }
    updateRealQuantity(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const id = Number(req.params.id);
                const result = yield this.service.updateRealQuantity(id, body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.updateRealQuantityRequest: `, error);
                next(error);
            }
        });
    }
    updateAdjustQuantity(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const id = Number(req.params.id);
                const result = yield this.service.updateAdjustQuantity(id, body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.updateAdjustQuantityRequest: `, error);
                next(error);
            }
        });
    }
}
exports.InventoryController = InventoryController;
