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
exports.TransactionWarehouseService = void 0;
const transaction_warehouse_repo_1 = require("../repositories/transaction-warehouse.repo");
const base_service_1 = require("./master/base.service");
const app_constant_1 = require("../../config/app.constant");
const logger_1 = __importDefault(require("../logger"));
class TransactionWarehouseService extends base_service_1.BaseService {
    constructor() {
        super(new transaction_warehouse_repo_1.TransactionWarehouseRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new TransactionWarehouseService();
        }
        return this.instance;
    }
    getAllByOrderDetailId(orderDetailIds_1) {
        return __awaiter(this, arguments, void 0, function* (orderDetailIds, type = app_constant_1.TransactionWarehouseType.OUT) {
            // const data = await this.repo.findMany({
            //     inventory_detail: {
            //         order_detail_id: { in: orderDetailIds }
            //     },
            // })
            // return data as ITransactionWarehouse[];
            const data = yield this.db.transactionWarehouses.findMany({
                where: {
                    inventory_detail: {
                        order_detail_id: { in: orderDetailIds },
                    },
                    type,
                },
                select: {
                    inventory_detail: {
                        select: {
                            order_detail_id: true,
                        },
                    },
                    quantity: true,
                    real_quantity: true,
                    convert_quantity: true,
                },
            });
            return data;
        });
    }
    getStockByProductIds(productIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.db.transactionWarehouses.findMany({
                where: {
                    product_id: { in: productIds },
                },
                select: {
                    product_id: true,
                    convert_quantity: true,
                    type: true,
                },
            }));
            const stockMap = this.calculateStock(data);
            return stockMap;
        });
    }
    calculateStock(data) {
        if (!data || data.length === 0)
            return;
        const stockMap = new Map();
        data.forEach((item) => {
            if (!item.product_id)
                return;
            const productId = item.product_id;
            if (!stockMap.has(productId)) {
                stockMap.set(productId, {
                    product_id: productId,
                    in: 0,
                    out: 0,
                    stock: 0,
                });
            }
            const stock = stockMap.get(productId);
            if (item.type === 'in') {
                stock.in += item.convert_quantity || 0;
            }
            else if (item.type === 'out') {
                stock.out += item.convert_quantity || 0;
            }
            stock.stock = stock.in - stock.out;
        });
        return stockMap;
    }
    createMany(body, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!body || body.length === 0)
                return;
            const mapData = this.autoMapConnection(body);
            yield this.repo.createMany(mapData, tx);
            logger_1.default.info(`Created ${mapData.length} transaction warehouse records`);
        });
    }
    sumQtyByOrder(order, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.repo.aggregate({ order_id: order.id, type: order.type === app_constant_1.OrderType.PURCHASE ? 'in' : 'out' }, {
                _sum: {
                    convert_quantity: true,
                },
            }, tx);
            return data._sum.convert_quantity || 0;
        });
    }
}
exports.TransactionWarehouseService = TransactionWarehouseService;
