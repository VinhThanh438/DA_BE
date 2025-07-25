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
exports.CommonDetailService = void 0;
const common_detail_repo_1 = require("../repositories/common-detail.repo");
const base_service_1 = require("./master/base.service");
const logger_1 = __importDefault(require("../logger"));
class CommonDetailService extends base_service_1.BaseService {
    constructor() {
        super(new common_detail_repo_1.CommonDetailRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new CommonDetailService();
        }
        return this.instance;
    }
    /**
     * Update the imported quantity for a order detail
     * @param where Query to find the order detail to update
     * @param data Object with type of update and quantity
     * @param tx Optional transaction client for atomic operations
     */
    updateImportQuantity(where, data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const detail = yield this.repo.findOne(where, false, tx);
            if (!detail) {
                logger_1.default.warn('Common detail not found for import quantity update');
                return;
            }
            const currentQty = detail.imported_quantity || 0;
            let newQty = currentQty;
            switch (data.type) {
                case 'increase':
                    newQty += data.quantity;
                    break;
                case 'decrease':
                    newQty -= data.quantity;
                    break;
                case 'update':
                    if (data.quantity !== 0)
                        newQty = newQty + (data.quantity - newQty);
                    break;
            }
            yield this.repo.update({ id: detail.id }, { imported_quantity: newQty }, tx);
            logger_1.default.info(`Updated import quantity for detail #${detail.id}: ${currentQty} → ${newQty}`);
            return { newQty, qty: detail.quantity || 0 };
        });
    }
}
exports.CommonDetailService = CommonDetailService;
