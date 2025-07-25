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
exports.CommissionService = void 0;
const commission_repo_1 = require("../repositories/commission.repo");
const base_service_1 = require("./master/base.service");
const quotation_request_detail_repo_1 = require("../repositories/quotation-request-detail.repo");
const representative_repo_1 = require("../repositories/representative.repo");
const logger_1 = __importDefault(require("../logger"));
class CommissionService extends base_service_1.BaseService {
    constructor() {
        super(new commission_repo_1.CommissionRepo());
        this.representativeRepo = new representative_repo_1.RepresentativeRepo();
        this.quotationRequestDetailRepo = new quotation_request_detail_repo_1.QuotationRequestDetailRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new CommissionService();
        }
        return this.instance;
    }
    getRepo() {
        return this.repo;
    }
    // parentId có thể là `quotation_request_id` hoặc `order_detail_id`
    createMany(data_1, tx_1) {
        return __awaiter(this, arguments, void 0, function* (data, tx, additionalFields = {}) {
            if (!data || data.length === 0)
                return;
            yield this.validateForeignKeys(data, {
                representative_id: this.representativeRepo,
                quotation_request_detail_id: this.quotationRequestDetailRepo,
            }, tx);
            const mapData = this.autoMapConnection(data, additionalFields);
            yield this.repo.createMany(mapData, tx);
        });
    }
    updateMany(data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data || data.length === 0)
                return;
            yield this.validateForeignKeys(data, {
                id: this.repo,
                representative_id: this.representativeRepo,
                quotation_request_detail_id: this.quotationRequestDetailRepo,
            }, tx);
            const mapData = this.autoMapConnection(data);
            for (const item of mapData) {
                const { id } = item, updateData = __rest(item, ["id"]);
                yield this.repo.update({ id }, updateData, tx);
            }
        });
    }
    deleteMany(ids, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ids || ids.length === 0)
                return;
            yield this.repo.deleteMany({ id: { in: ids } }, tx, false);
            logger_1.default.info('[commission.service] Deleted ids:', ids);
        });
    }
}
exports.CommissionService = CommissionService;
