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
exports.BomDetailService = void 0;
const bom_detail_repo_1 = require("../../repositories/bom-detail.repo");
const base_service_1 = require("./base.service");
const logger_1 = __importDefault(require("../../logger"));
class BomDetailService extends base_service_1.BaseService {
    constructor() {
        super(new bom_detail_repo_1.BomDetailRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new BomDetailService();
        }
        return this.instance;
    }
    createMany(data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data || data.length === 0)
                return;
            yield this.repo.createMany(data, tx);
            logger_1.default.info(`Created ${data.length} bom details successfully.`);
        });
    }
    updateMany(data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data || data.length === 0)
                return;
            for (const item of data) {
                yield this.repo.update({ id: item.id }, item, tx);
            }
            logger_1.default.info(`Updated ${data.length} bom details successfully.`);
        });
    }
    deleteMany(ids, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ids || ids.length === 0)
                return;
            yield this.repo.deleteMany({ id: { in: ids } }, tx, false);
            logger_1.default.info(`Deleted ${ids.length} bom details successfully.`);
        });
    }
}
exports.BomDetailService = BomDetailService;
