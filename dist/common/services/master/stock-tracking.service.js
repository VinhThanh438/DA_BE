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
exports.StockTrackingService = void 0;
const stock_tracking_repo_1 = require("../../repositories/stock-tracking.repo");
const base_service_1 = require("./base.service");
const logger_1 = __importDefault(require("../../logger"));
class StockTrackingService extends base_service_1.BaseService {
    constructor() {
        super(new stock_tracking_repo_1.StockTrackingRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new StockTrackingService();
        }
        return this.instance;
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isDone } = query, otherQuery = __rest(query, ["isDone"]);
            const where = Object.assign({}, otherQuery);
            const data = yield this.repo.paginate(where, true);
            return data;
        });
    }
    createMany(body, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const mapData = this.autoMapConnection(body);
            yield this.repo.createMany(mapData, tx);
            logger_1.default.info(`Created ${mapData.length} stock trackings`);
        });
    }
    deleteMany(ids, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ids || ids.length === 0)
                return;
            yield this.repo.deleteMany({ id: { in: ids } }, tx, false);
            logger_1.default.info('Deleted stock trackings with ids:', ids);
        });
    }
    updateItem(id, data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.repo.update({ id }, data, tx);
            logger_1.default.info('Updated stock tracking with id:', id);
        });
    }
}
exports.StockTrackingService = StockTrackingService;
