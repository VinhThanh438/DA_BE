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
exports.CommonService = void 0;
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const generate_unique_code_helper_1 = require("../helpers/generate-unique-code.helper");
const common_detail_repo_1 = require("../repositories/common-detail.repo");
const product_repo_1 = require("../repositories/product.repo");
const app_constant_1 = require("../../config/app.constant");
class CommonService {
    static resolvePrefixCode(name) {
        const entityName = name.toUpperCase();
        const prefix = app_constant_1.ModelPrefixMap[entityName];
        if (!prefix) {
            return app_constant_1.ModelPrefixMap[app_constant_1.PrefixCode.OTHER];
        }
        return prefix;
    }
    static getCode(modelName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!modelName || !(modelName in app_constant_1.ModelStringMaps)) {
                throw new api_error_1.APIError({
                    message: 'model.not_found',
                    status: errors_1.StatusCode.BAD_REQUEST,
                });
            }
            let lastRecord = yield app_constant_1.ModelStringMaps[modelName].findFirst({
                orderBy: {
                    id: 'desc',
                },
                select: {
                    id: true,
                    code: true,
                },
            });
            if (!lastRecord)
                lastRecord = 0;
            const generateCodeWithCheck = (lastCode) => __awaiter(this, void 0, void 0, function* () {
                let addCodeString = 0;
                const newCode = (0, generate_unique_code_helper_1.generateUniqueCode)({
                    lastCode,
                    prefix: this.resolvePrefixCode(modelName),
                });
                const existingRecord = yield app_constant_1.ModelStringMaps[modelName].findFirst({
                    where: {
                        code: newCode,
                    },
                });
                if (existingRecord) {
                    addCodeString++;
                    return generateCodeWithCheck(`${lastCode}${addCodeString}`);
                }
                return newCode;
            });
            return generateCodeWithCheck((lastRecord === null || lastRecord === void 0 ? void 0 : lastRecord.code) || null);
        });
    }
    static getContent(detailsData) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Promise.all(detailsData.map((item) => __awaiter(this, void 0, void 0, function* () {
                const id = item.order_detail_id || item.id;
                const orderDetail = yield this.commonDetailRepo.findOne({ id }, true);
                const product = yield this.productRepo.findOne({ id: orderDetail === null || orderDetail === void 0 ? void 0 : orderDetail.product_id });
                return product === null || product === void 0 ? void 0 : product.name;
            })));
            return data.join(', ');
        });
    }
    static transformProductDataStock(product) {
        const value = (product.stock_trackings || []).length > 0 ? product.stock_trackings : product.stock_trackings_child;
        let stockTrackings = value || [];
        // if (warehouseId) {
        //     stockTrackings = (stockTrackings).filter((x: IStockTracking) => x.warehouse_id === warehouseId)
        // }
        const totalBalance = stockTrackings.reduce((sum, tracking) => {
            return sum + tracking.current_balance;
        }, 0);
        return Object.assign(Object.assign({}, product), { stock_trackings: stockTrackings, current_balance: totalBalance });
    }
}
exports.CommonService = CommonService;
CommonService.commonDetailRepo = new common_detail_repo_1.CommonDetailRepo();
CommonService.productRepo = new product_repo_1.ProductRepo();
