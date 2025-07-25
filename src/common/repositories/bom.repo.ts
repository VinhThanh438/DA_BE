import { IFilterArgs, IPaginationInput, IPaginationResponse, SearchField } from '@common/interfaces/common.interface';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { Bom, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { BomSelection, BomSelectionAll } from './prisma/prisma.select';

export class BomRepo extends BaseRepo<Bom, Prisma.BomSelect, Prisma.BomWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().bom;
    protected defaultSelect = BomSelection;
    protected detailSelect = BomSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'bom';
    protected timeFieldDefault: string = 'created_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [],
    };

    async getMaterialEstimation(query: any, includeRelations?: boolean): Promise<any> {
        const { order_id, product_id, start_date, end_date, group_by = 'order' } = query;

        // Query orders with products and their material requirements
        const orders = await this.db.findMany({
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
    }

    private processMaterialEstimation(data: any[], groupBy: string): any {
        const result = {
            summary: {
                total_orders: 0,
                total_products: 0,
                materials_summary: [] as any[],
            },
            details: [] as any[],
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
            bom.bom_details.forEach((detail: any) => {
                const materialKey = detail.material.id;
                if (!group.materials.has(materialKey)) {
                    group.materials.set(materialKey, {
                        material_id: detail.material.id,
                        material_name: detail.material.name,
                        material_code: detail.material.code,
                        unit: detail.material.unit?.name || 'Kg',
                        required_quantity: 0,
                        exported_quantity: 0,
                    });
                }

                const material = group.materials.get(materialKey);
                material.required_quantity += detail.quantity || 0;
            });
        });

        // Convert to array and format
        Array.from(groupedData.values()).forEach((group: any) => {
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
