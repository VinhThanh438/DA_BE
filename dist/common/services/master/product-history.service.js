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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductHistoryService = void 0;
const product_history_repo_1 = require("../../repositories/product-history.repo");
const base_service_1 = require("./base.service");
class ProductHistoryService extends base_service_1.BaseService {
    constructor() {
        super(new product_history_repo_1.ProductHistoryRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProductHistoryService();
        }
        return this.instance;
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startAt, endAt, keyword, page, size } = query, restQuery = __rest(query, ["startAt", "endAt", "keyword", "page", "size"]);
            const totalRecords = yield this.db.products.count({
                where: Object.assign(Object.assign({}, restQuery), { product_histories: {
                        some: {
                            time_at: {
                                gte: startAt,
                                lte: endAt,
                            },
                        },
                    } }),
            });
            const currentPage = Math.min(page || 1, totalRecords);
            const skip = (currentPage - 1) * (size || 20);
            const data = yield this.db.products.findMany({
                where: Object.assign(Object.assign({}, restQuery), { product_histories: {
                        some: {
                            time_at: {
                                gte: startAt,
                                lte: endAt,
                            },
                        },
                    } }),
                include: {
                    product_histories: {
                        where: {
                            time_at: {
                                gte: startAt,
                                lte: endAt,
                            },
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: size || 20,
            });
            return {
                data,
                pagination: {
                    totalPages: totalRecords > 0 ? Math.ceil(totalRecords / (size || 20)) : 1,
                    currentPage,
                    size: size || 20,
                    totalRecords: totalRecords,
                },
            };
        });
    }
}
exports.ProductHistoryService = ProductHistoryService;
