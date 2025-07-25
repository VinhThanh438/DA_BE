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
exports.MeshService = void 0;
const product_repo_1 = require("../repositories/product.repo");
const mesh_repo_1 = require("../repositories/mesh.repo");
const mesh_detail_service_1 = require("./master/mesh-detail.service");
const base_service_1 = require("./master/base.service");
class MeshService extends base_service_1.BaseService {
    constructor() {
        super(new mesh_repo_1.MeshRepo());
        this.productRepo = new product_repo_1.ProductRepo();
        this.meshDetailService = mesh_detail_service_1.MeshDetailService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new MeshService();
        }
        return this.instance;
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            delete query.organizationId;
            delete query.OR;
            const data = yield this.repo.paginate(query, true);
            data.summary = (yield this.summary({})) || {};
            return data;
        });
    }
    summary(where) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const sumQty = yield this.repo.aggregate(where, {
                _sum: { total_quantity: true, total_weight: true, total_area: true },
            });
            return {
                total_quantity: ((_a = sumQty._sum) === null || _a === void 0 ? void 0 : _a.total_quantity) || 0,
                total_weight: ((_b = sumQty._sum) === null || _b === void 0 ? void 0 : _b.total_weight) || 0,
                total_area: ((_c = sumQty._sum) === null || _c === void 0 ? void 0 : _c.total_area) || 0,
            };
        });
    }
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const { details } = body, rest = __rest(body, ["details"]);
                const mapData = this.autoMapConnection([rest]);
                const id = yield this.repo.create(mapData[0], tx);
                yield this.validateForeignKeys(details, {
                    product_id: this.productRepo,
                }, tx);
                const detailData = details.map((d) => {
                    return Object.assign(Object.assign({}, d), { name: this.meshDetailService.handleName(d), mesh_id: id });
                });
                const mapDetailData = this.autoMapConnection(detailData);
                yield this.meshDetailService.createMany(mapDetailData, tx);
                const dataCalculate = yield this.calculateTotal(id, detailData, tx);
                yield this.updateTotal(id, dataCalculate, tx);
                return { id };
            }));
        });
    }
    update(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingMesh = yield this.repo.findOne({ id });
            if (!existingMesh)
                return { id };
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const { add, update, delete: deleteIds } = body, meshData = __rest(body, ["add", "update", "delete"]);
                const mapData = this.autoMapConnection([meshData]);
                yield this.repo.update({ id }, mapData[0], tx);
                if (add && (add === null || add === void 0 ? void 0 : add.length) > 0) {
                    yield this.validateForeignKeys(add, {
                        product_id: this.productRepo,
                    }, tx);
                    const mapData = this.autoMapConnection(add, { mesh_id: id });
                    yield this.meshDetailService.createMany(mapData, tx);
                }
                if (update && (update === null || update === void 0 ? void 0 : update.length) > 0) {
                    yield this.validateForeignKeys(update, {
                        product_id: this.productRepo,
                    }, tx);
                    const mapData = this.autoMapConnection(update);
                    yield this.meshDetailService.updateMany(mapData, tx);
                }
                if (deleteIds && (deleteIds === null || deleteIds === void 0 ? void 0 : deleteIds.length) > 0) {
                    yield this.meshDetailService.deleteMany(deleteIds, tx);
                }
                // calculate total again
                const updatedDetails = yield this.meshDetailService.findAll({ mesh_id: id }, tx);
                const dataCalculate = yield this.calculateTotal(id, updatedDetails, tx);
                yield this.updateTotal(id, dataCalculate, tx);
            }));
            return { id };
        });
    }
    calculateTotal(id, data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalQuantity = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
            const totalWeight = this.meshDetailService.calculateTotalWeight(data);
            const totalArea = this.meshDetailService.calculateTotalArea(data);
            return {
                total_quantity: totalQuantity,
                total_weight: totalWeight,
                total_area: totalArea,
            };
        });
    }
    updateTotal(id, data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.repo.update({ id }, data, tx);
        });
    }
}
exports.MeshService = MeshService;
