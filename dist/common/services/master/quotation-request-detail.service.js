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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationRequestDetailService = void 0;
const quotation_request_detail_repo_1 = require("../../repositories/quotation-request-detail.repo");
const product_repo_1 = require("../../repositories/product.repo");
const unit_repo_1 = require("../../repositories/unit.repo");
const base_service_1 = require("./base.service");
class QuotationRequestDetailService extends base_service_1.BaseService {
    constructor() {
        super(new quotation_request_detail_repo_1.QuotationRequestDetailRepo());
        this.productRepo = new product_repo_1.ProductRepo();
        this.unitRepo = new unit_repo_1.UnitRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new QuotationRequestDetailService();
        }
        return this.instance;
    }
    getRepo() {
        return this.repo;
    }
    createMany(quotationId, data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateForeignKeys(data, {
                product_id: this.productRepo,
                unit_id: this.unitRepo,
            }, tx);
            const mapData = this.autoMapConnection(data, { quotation_request_id: quotationId });
            yield this.repo.createMany(mapData, tx);
        });
    }
    updateMany(data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateForeignKeys(data, {
                id: this.repo,
                product_id: this.productRepo,
                unit_id: this.unitRepo,
            }, tx);
            const mapData = this.autoMapConnection(data);
            yield this.repo.updateMany(mapData, tx);
        });
    }
    deleteMany(ids, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.repo.deleteMany({ id: { in: ids } }, tx);
        });
    }
}
exports.QuotationRequestDetailService = QuotationRequestDetailService;
