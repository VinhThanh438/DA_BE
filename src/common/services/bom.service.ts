import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreateWorkPricing, IUpdateWorkPricing } from '@common/interfaces/work-pricing.interface';
import { ICreateBomDetail, IUpdateBomDetail } from '@common/interfaces/bom-detail.interface';
import { ICreateBom, IUpdateBom } from '@common/interfaces/bom.interface';
import { ProductRepo } from '@common/repositories/product.repo';
import { WorkPricingService } from './work-pricing.service';
import { UnitRepo } from '@common/repositories/unit.repo';
import { BomRepo } from '@common/repositories/bom.repo';
import { BaseService } from './master/base.service';
import { Bom, Prisma } from '.prisma/client';
import { TransactionWarehouseService } from './transaction-warehouse.service';
import { BomDetailService } from './master/bom-detail.service';

export class BomService extends BaseService<Bom, Prisma.BomSelect, Prisma.BomWhereInput> {
    private static instance: BomService;
    protected repo: BomRepo;
    private productRepo: ProductRepo = new ProductRepo();
    private unitRepo: UnitRepo = new UnitRepo();
    private bomDetailService = BomDetailService.getInstance();
    private workPricingService = WorkPricingService.getInstance();
    private transactionWarehouseService = TransactionWarehouseService.getInstance();

    private constructor() {
        super(new BomRepo());
        this.repo = new BomRepo();
    }

    static getInstance(): BomService {
        if (!this.instance) {
            this.instance = new BomService();
        }
        return this.instance;
    }

    async createBom(body: ICreateBom, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        await this.validateForeignKeys(body, {
            product_id: this.productRepo,
        });

        let bomId = 0;

        const runTransaction = async (tx: Prisma.TransactionClient) => {
            const { details, work_pricings, ...restData } = body;

            const bomData = this.autoMapConnection([restData]);
            bomId = await this.repo.create(bomData[0], tx);

            await this.validateForeignKeys(
                details,
                {
                    product_id: this.productRepo,
                    unit_id: this.unitRepo,
                },
                tx,
            );

            const mapBomData = this.autoMapConnection(details, { bom_id: bomId });
            await this.bomDetailService.createMany(mapBomData, tx);

            await this.validateForeignKeys(
                work_pricings,
                {
                    unit_id: this.unitRepo,
                    // production_step_id: this.unitRepo,
                },
                tx,
            );

            const mapWorkPricingData = this.autoMapConnection(work_pricings, { bom_id: bomId });
            await this.workPricingService.createMany(mapWorkPricingData, tx);
        };

        if (tx) {
            await runTransaction(tx);
        } else {
            await this.db.$transaction(async (tx) => {
                await runTransaction(tx);
            });
        }

        return { id: bomId };
    }

    async updateBom(id: number, body: IUpdateBom): Promise<IIdResponse> {
        const existingBom = await this.repo.findOne({ id });
        if (!existingBom) return { id };

        if (body.product_id) {
            await this.validateForeignKeys(body, {
                product_id: this.productRepo,
            });
        }

        await this.db.$transaction(async (tx) => {
            const {
                add,
                update,
                delete: deleteIds,
                work_pricings_add,
                work_pricings_update,
                work_pricings_delete,
                ...bomData
            } = body;

            const mapData = this.autoMapConnection([bomData]);
            await this.repo.update({ id }, mapData[0], tx);

            await this.handleBomDetails(id, add, update, deleteIds, tx);

            await this.handleWorkPricings(id, work_pricings_add, work_pricings_update, work_pricings_delete, tx);
        });

        return { id };
    }

    private async handleBomDetails(
        bomId: number,
        add?: ICreateBomDetail[],
        update?: IUpdateBomDetail[],
        deleteIds?: number[],
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        if (add && add?.length > 0) {
            await this.validateForeignKeys(
                add,
                {
                    product_id: this.productRepo,
                    unit_id: this.unitRepo,
                },
                tx,
            );

            const mapData = this.autoMapConnection(add, { bom_id: bomId });
            await this.bomDetailService.createMany(mapData, tx);
        }

        if (update && update?.length > 0) {
            await this.validateForeignKeys(
                update,
                {
                    product_id: this.productRepo,
                    unit_id: this.unitRepo,
                },
                tx,
            );

            const mapData = this.autoMapConnection(update);
            await this.bomDetailService.updateMany(mapData, tx);
        }

        if (deleteIds && deleteIds?.length > 0) {
            await this.bomDetailService.deleteMany(deleteIds, tx);
        }
    }

    private async handleWorkPricings(
        bomId: number,
        add?: ICreateWorkPricing[],
        update?: IUpdateWorkPricing[],
        deleteIds?: number[],
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        if (add && add?.length > 0) {
            await this.validateForeignKeys(
                add,
                {
                    // production_step_id: this.productionStepRepo,
                    unit_id: this.unitRepo,
                },
                tx,
            );

            const mapData = this.autoMapConnection(add, { bom_id: bomId });
            await this.workPricingService.createMany(mapData, tx);
        }

        if (update && update?.length > 0) {
            await this.validateForeignKeys(
                update,
                {
                    // production_step_id: this.productionStepRepo,
                    unit_id: this.unitRepo,
                },
                tx,
            );

            const mapData = this.autoMapConnection(update);
            await this.workPricingService.updateMany(mapData, tx);
        }

        if (deleteIds && deleteIds?.length > 0) {
            await this.workPricingService.deleteMany(deleteIds, tx);
        }
    }

    private async queryMaterialEstimation(query: IPaginationInput) {
        const { page = 1, size = 10, keyword, startAt, endAt, ...otherQuery } = query;

        // Build where condition for order details
        const detailsWhere: any = {
            order: {
                type: 'production',
                ...(startAt &&
                    endAt && {
                    time_at: {
                        gte: new Date(startAt),
                        lte: new Date(endAt),
                    },
                }),
                ...(keyword && {
                    OR: [
                        { code: { contains: keyword, mode: 'insensitive' } },
                        { address: { contains: keyword, mode: 'insensitive' } },
                    ],
                }),
            },
            ...(keyword && {
                product: {
                    name: { contains: keyword, mode: 'insensitive' },
                },
            }),
            ...otherQuery,
        };

        // Get total count and paginated data
        const [total, orderDetails] = await Promise.all([
            this.db.commonDetails.count({ where: detailsWhere }),
            this.db.commonDetails.findMany({
                where: detailsWhere,
                select: {
                    id: true,
                    quantity: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            unit: true,
                            bom: {
                                select: {
                                    id: true,
                                    details: {
                                        select: {
                                            id: true,
                                            quantity: true,
                                            unit: true,
                                            material: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    order: {
                        select: {
                            id: true,
                            code: true,
                            time_at: true,
                            productions: {
                                select: {
                                    details: {
                                        select: {
                                            id: true,
                                            quantity: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                skip: (page - 1) * size,
                take: size,
                orderBy: {
                    order: { time_at: 'desc' },
                },
            }),
        ]);

        return { total, orderDetails, page, size };
    }

    async getMaterialEstimation(query: IPaginationInput): Promise<IPaginationResponse> {
        const { total, orderDetails, page, size } = await this.queryMaterialEstimation(query);

        const ordersMap = new Map();
        let orderDetailIds: number[] = [];
        let materialIds: number[] = [];

        (orderDetails as Array<{ order?: any; id: number; product?: any; quantity: number }>).forEach((detail) => {
            if (!detail.order) return; // Skip if no order data

            orderDetailIds.push(detail.id);
            const orderId = detail.order.id;

            if (!ordersMap.has(orderId)) {
                ordersMap.set(orderId, {
                    id: detail.order.id,
                    code: detail.order.code,
                    time_at: detail.order.time_at,
                    details: [],
                    productions: detail.order.productions,
                });
            }

            ordersMap.get(orderId).details.push({
                id: detail.id,
                product: detail.product,
                quantity: detail.quantity,
            });

            // collect material ids
            detail.product?.bom?.details.forEach((bomDetail: any) => {
                const materialId = bomDetail.material.id;
                if (!materialIds.includes(materialId)) {
                    materialIds.push(materialId);
                }
            });
        });

        // get warehouse and stock data
        const [txWarehouseData, stockMap] = await Promise.all([
            this.transactionWarehouseService.getAllByOrderDetailId(orderDetailIds),
            this.transactionWarehouseService.getStockByProductIds(materialIds),
        ]);

        // create warehouse lookup map
        const txWarehouseMap = new Map<string, number>();
        txWarehouseData.forEach((tx) => {
            const key = `${tx.inventory_detail?.order_detail_id}`;
            txWarehouseMap.set(key, (txWarehouseMap.get(key) || 0) + (tx.quantity || 0));
        });

        // create stock lookup map

        // get tồn kho của các sản phẩm
        // const stockMap = await this.transactionWarehouseService.getStockByProductIds(materialIds)

        const orders = Array.from(ordersMap.values());
        const { result, boms, summary } = this.processMaterialEstimation(orders, txWarehouseMap, stockMap);

        return {
            data: result,
            boms,
            summary,
            pagination: {
                totalRecords: total,
                currentPage: page,
                size,
                totalPages: Math.ceil(total / size),
            },
        };
    }

    private processMaterialEstimation(orders: any[], txWarehouseMap: Map<string, number>, stockMap: any) {
        const result: any[] = [];
        let totalOrderQty = 0;
        let totalProductionQty = 0;
        let materialIds: number[] = [];

        function getMaterial(material: any) {
            return {
                id: material.id,
                name: material.name,
                code: material.code,
            };
        }

        const allMaterials = new Map();
        orders.forEach((order) => {
            order.details.forEach((detail: any) => {
                detail.product.bom?.details.forEach((bomDetail: any) => {
                    const materialId = bomDetail.material.id;
                    if (!allMaterials.has(materialId)) {
                        allMaterials.set(materialId, getMaterial(bomDetail.material));
                    }

                    if (!materialIds.includes(materialId)) {
                        materialIds.push(materialId);
                    }
                });
            });
        });

        const materialData = Array.from(allMaterials.values());

        const bomQtyMap = new Map();
        materialData.forEach((material) => {
            bomQtyMap.set(material.id, {
                material_id: material.id,
                order_qty: 0,
                production_qty: 0,
                stock_qty: stockMap?.get(material.id)?.stock || 0,
            });
        });

        const orderProductGroups = new Map();

        orders.forEach((order) => {
            order.details.forEach((detail: any) => {
                const orderProductKey = `${order.id}_${detail.product.id}`;

                if (!orderProductGroups.has(orderProductKey)) {
                    orderProductGroups.set(orderProductKey, {
                        id: detail.id,
                        order,
                        product: detail.product,
                        order_quantity: 0,
                        production_quantity: 0,
                        materials: new Map(),
                    });
                }
                const group = orderProductGroups.get(orderProductKey);
                group.order_quantity += detail.quantity;

                detail.product.bom?.details.forEach((bomDetail: any) => {
                    const materialId = bomDetail.material.id;

                    if (!group.materials.has(materialId)) {
                        group.materials.set(materialId, {
                            material: getMaterial(bomDetail.material),
                            quantity: bomDetail.quantity,
                        });
                    }
                });
            });

            // Add production quantities
            order.productions?.forEach((production: any) => {
                production.details?.forEach((prodDetail: any) => {
                    const orderProductKey = `${order.id}_${prodDetail.product.id}`;

                    const group = orderProductGroups.get(orderProductKey);
                    if (group) {
                        group.production_quantity += prodDetail.quantity;
                    }
                });
            });
        });

        // Convert to result format
        orderProductGroups.forEach((group: any) => {
            const exported_warehouse = txWarehouseMap.get(`${group.id}`) || 0;
            totalOrderQty += group.order_quantity;
            totalProductionQty += group.production_quantity;

            const order_remaining = group.order_quantity - exported_warehouse;
            const production_remaining = group.production_quantity - exported_warehouse;

            const row = {
                id: group.order.id,
                code: group.order.code,
                time_at: group.order.time_at,
                product: {
                    id: group.product.id,
                    name: group.product.name,
                },
                exported_warehouse,
                order_qty: group.order_quantity,
                production_qty: group.production_quantity,
                boms: materialData.map((materialObj) => {
                    const materialData = group.materials.get(materialObj.id);

                    if (materialData) {
                        const order_qty_calc = materialData.quantity * order_remaining;
                        const production_qty_calc = materialData.quantity * production_remaining;

                        const bomItem = bomQtyMap.get(materialObj.id);
                        bomItem.order_qty += order_qty_calc;
                        bomItem.production_qty += production_qty_calc;

                        return {
                            material: materialData.material,
                            value: materialData.quantity,
                            order_qty: materialData.quantity * order_remaining,
                            production_qty: materialData.quantity * production_remaining,
                        };
                    }

                    return {
                        material: materialObj,
                        value: 0,
                        order_qty: 0,
                        production_qty: 0,
                    };
                }),
            };

            result.push(row);
        });

        const boms = Array.from(bomQtyMap.values());

        return {
            result,
            boms,
            summary: {
                order_qty: totalOrderQty,
                production_qty: totalProductionQty,
            },
        };
    }
}
