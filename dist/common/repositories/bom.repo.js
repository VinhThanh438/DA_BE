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
exports.BomRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class BomRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().bom;
        this.defaultSelect = prisma_select_1.BomSelection;
        this.detailSelect = prisma_select_1.BomSelectionAll;
        this.modelKey = 'bom';
        this.timeFieldDefault = 'created_at';
        this.searchableFields = {
            basic: [],
        };
    }
    getMaterialEstimation(query, includeRelations) {
        return __awaiter(this, void 0, void 0, function* () {
            const { order_id, product_id, start_date, end_date, group_by = 'order' } = query;
            // Query orders with products and their material requirements
            const orders = yield this.db.findMany({
                // include: {
                //     product: {
                //         select: {
                //             id: true,
                //             name: true,
                //             code: true
                //         }
                //     },
                //     bom_details: {
                //         include: {
                //             material: {
                //                 select: {
                //                     id: true,
                //                     name: true,
                //                     code: true,
                //                     unit: true
                //                 }
                //             }
                //         }
                //     }
                // }
                select: {
                    id: true,
                },
            });
            // Process and group the data
            return this.processMaterialEstimation(orders, group_by);
        });
    }
    processMaterialEstimation(data, groupBy) {
        const result = {
            summary: {
                total_orders: 0,
                total_products: 0,
                materials_summary: [],
            },
            details: [],
        };
        const groupedData = new Map();
        data.forEach((bom) => {
            const key = `${bom.id}-${bom.product.id}`;
            if (!groupedData.has(key)) {
                groupedData.set(key, {
                    order_id: bom.id,
                    order_code: bom.code,
                    // delivery_date: bom.delivery_date,
                    product_id: bom.product.id,
                    product_name: bom.product.name,
                    order_quantity: 0, // Từ order_details
                    production_quantity: 0, // Từ production_orders
                    materials: new Map(),
                });
            }
            const group = groupedData.get(key);
            // Calculate material requirements
            bom.bom_details.forEach((detail) => {
                var _a;
                const materialKey = detail.material.id;
                if (!group.materials.has(materialKey)) {
                    group.materials.set(materialKey, {
                        material_id: detail.material.id,
                        material_name: detail.material.name,
                        material_code: detail.material.code,
                        unit: ((_a = detail.material.unit) === null || _a === void 0 ? void 0 : _a.name) || 'Kg',
                        required_quantity: 0,
                        exported_quantity: 0,
                    });
                }
                const material = group.materials.get(materialKey);
                material.required_quantity += detail.quantity || 0;
            });
        });
        // Convert to array and format
        Array.from(groupedData.values()).forEach((group) => {
            const materials = Array.from(group.materials.values());
            result.details.push({
                stt: result.details.length + 1,
                delivery_date: group.delivery_date,
                order_code: group.order_code,
                product_name: group.product_name,
                data_type: [
                    {
                        type: 'Đơn hàng',
                        quantity: group.order_quantity,
                        exported_quantity: 0,
                    },
                    {
                        type: 'Lệnh sản xuất',
                        quantity: group.production_quantity,
                        exported_quantity: 0,
                    },
                ],
                materials,
            });
        });
        result.summary.total_orders = new Set(data.map((d) => d.order.id)).size;
        result.summary.total_products = new Set(data.map((d) => d.product.id)).size;
        return result;
    }
}
exports.BomRepo = BomRepo;
