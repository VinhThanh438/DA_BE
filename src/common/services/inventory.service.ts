import { BaseService } from './base.service';
import { Inventories, Prisma } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { calculateConvertQty } from '@common/helpers/calculate-convert-qty';
import {
    IApproveRequest,
    IIdResponse,
    IPaginationInput,
    IPaginationResponse,
} from '@common/interfaces/common.interface';
import { IInventory, IInventoryDifferent, InventoryDetail } from '@common/interfaces/inventory.interface';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { InventoryDetailRepo } from '@common/repositories/inventory-detail.repo';
import { InventoryRepo } from '@common/repositories/inventory.repo';
import { OrderRepo } from '@common/repositories/order.repo';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { TransactionWarehouseRepo } from '@common/repositories/transaction-warehouse.repo';
import { WarehouseRepo } from '@common/repositories/warehouse.repo';
import { CommonApproveStatus, InventoryType, InventoryTypeDirectionMap } from '@config/app.constant';
import { CommonDetailService } from './common-detail.service';
import { handleFiles } from '@common/helpers/handle-files';
import { deleteFileSystem } from '@common/helpers/delete-file-system';
import {
    InventoryDetailSelection,
    InventoryDetailSelectionAll,
    InventoryDetailSelectionImportDetail,
    InventoryDetailSelectionProduct,
} from '@common/repositories/prisma/inventory-detail.select';
import { transformDecimal } from '@common/helpers/transform.util';
import { ShippingPlanRepo } from '@common/repositories/shipping-plan.repo';
import { buildArrayFilters } from '@common/helpers/build-array-filters';
import eventbus from '@common/eventbus';
import { EVENT_CREATE_GATELOG } from '@config/event.constant';
import { IGateLog } from '@common/interfaces/gate-log.interface';
import { OrderService } from './order.service';
import { ProductRepo } from '@common/repositories/product.repo';
import { IProduct } from '@common/interfaces/product.interface';
import { CommonService } from './common.service';
import logger from '@common/logger';

export class InventoryService extends BaseService<Inventories, Prisma.InventoriesSelect, Prisma.InventoriesWhereInput> {
    private static instance: InventoryService;
    private inventoryDetailRepo: InventoryDetailRepo = new InventoryDetailRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private organizationRepo: OrganizationRepo = new OrganizationRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private warehouseRepo: WarehouseRepo = new WarehouseRepo();
    private orderDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private shippingPlanRepo: ShippingPlanRepo = new ShippingPlanRepo();
    private transactionWarehouseRepo: TransactionWarehouseRepo = new TransactionWarehouseRepo();
    private productRepo: ProductRepo = new ProductRepo();
    private commonDetailService: CommonDetailService = CommonDetailService.getInstance();
    // private orderService: OrderService = OrderService.getInstance();

    private constructor() {
        super(new InventoryRepo());
    }

    public static getInstance(): InventoryService {
        if (!this.instance) {
            this.instance = new InventoryService();
        }
        return this.instance;
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const { productIds, warehouseIds, supplierIds, deliveryIds, ...restQuery } = query;
        // supplier = partner in order
        // delivery = partner in shipping plan

        const detailAndConditions: Prisma.InventoryDetailsWhereInput[] = [];
        if (productIds?.length) {
            detailAndConditions.push({
                order_detail: {
                    product_id: { in: productIds },
                },
            });
        }

        const detailCondition: Prisma.InventoryDetailsWhereInput =
            detailAndConditions.length > 0 ? { AND: detailAndConditions } : {};

        const where: Prisma.InventoriesWhereInput = {
            ...(detailAndConditions.length > 0 && {
                details: {
                    some: { AND: detailAndConditions },
                },
            }),
            ...(deliveryIds &&
                deliveryIds.length > 0 && {
                shipping_plan: {
                    partner_id: { in: deliveryIds },
                },
            }),
            ...(supplierIds &&
                supplierIds.length > 0 && {
                order: {
                    partner_id: { in: supplierIds },
                },
            }),
            ...(warehouseIds &&
                warehouseIds.length > 0 && {
                warehouse_id: { in: warehouseIds },
            }),
        };

        const selectCondition: Prisma.InventoriesSelect = {
            details: {
                where: detailCondition,
                select: InventoryDetailSelectionAll,
            },
        };

        const result = await this.repo.paginate(restQuery, true, where, selectCondition);

        return result;
    }

    public async createInventory(request: Partial<IInventory>, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        let inventoryId: number = 0;

        await this.isExist({ code: request.code });

        await this.validateForeignKeys(
            request,
            {
                customer_id: this.partnerRepo,
                supplier_id: this.partnerRepo,
                shipping_plan_id: this.shippingPlanRepo,
                employee_id: this.employeeRepo,
                organization_id: this.organizationRepo,
                // order_id: this.orderRepo,
                warehouse_id: this.warehouseRepo,
            },
            tx,
        );

        // let dataImportInOrder: Record<number, number> = {};
        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const { details, order_id, shipping_plan_id, warehouse_id, ...inventoryData } = request;
            // check dung sai
            const existingOrder = await this.orderRepo.findOne({ id: order_id }, false, transaction)
            const tolerance = existingOrder?.tolerance || 0;

            if (details && details.length > 0) {
                await this.checkProductAndOrderTolerances(order_id || 0, details, tolerance, transaction);
            }

            let content = '';

            if (details && details.length > 0) {
                content = await CommonService.getContent(details);
            }

            inventoryId = await this.repo.create(
                {
                    ...inventoryData,
                    content,
                    order: order_id ? { connect: { id: order_id } } : undefined,
                    shipping_plan: shipping_plan_id ? { connect: { id: shipping_plan_id } } : undefined,
                    warehouse: warehouse_id ? { connect: { id: warehouse_id } } : undefined,
                } as Partial<Inventories>,
                transaction,
            );

            if (details && details.length > 0) {
                await this.validateForeignKeys(details, { order_detail_id: this.orderDetailRepo }, transaction);

                const dataDetails = details.map((item) => {
                    const { key, order_detail, ...rest } = item;

                    return {
                        ...rest,
                        inventory_id: inventoryId,
                    };
                });

                const detailData = await this.inventoryDetailRepo.createMany(dataDetails, transaction);

                // let totalInitQty = 0;
                // let totalImportQty = 0;
                // for (const [key, value] of Object.entries(dataImportInOrder)) {
                //     const qtyInfo = await this.commonDetailService.updateImportQuantity(
                //         { id: Number(key) },
                //         { type: 'increase', quantity: value },
                //         transaction,
                //     );
                //     totalImportQty += qtyInfo?.newQty || 0;
                //     totalInitQty += qtyInfo?.qty || 0;
                // }

                // // update is done in order
                // const percent = totalInitQty > 0 ? (totalImportQty / totalInitQty) * 100 : 0;
                // await this.orderRepo.update(
                //     { id: inventoryData.order_id },
                //     { delivery_progress: percent },
                //     transaction,
                // );

                // return detailData.map((item) => {
                //     const type: InventoryType = inventoryData.type ?? InventoryType.FINISHED_IN;
                //     return {
                //         inventory: { connect: { id: inventoryId } },
                //         inventory_detail: { connect: { id: item.id } },
                //         warehouse: { connect: { id: inventoryData.warehouse_id! } },
                //         order: { connect: { id: inventoryData.order_id } },
                //         // order_detail: { connect: { id: item.order_detail_id } },
                //         real_quantity: item.real_quantity ?? 0,
                //         quantity: item.quantity ?? 0,
                //         time_at: inventoryData.time_at!,
                //         type: InventoryTypeDirectionMap[type],
                //         // inventory_id: inventoryId,
                //         // inventory_detail_id: item.id,
                //         // warehouse_id: inventoryData.warehouse_id,
                //         // order_id: inventoryData.order_id,
                //         // order_detail_id: item.order_detail_id,
                //     };
                // });
            } else {
                throw new APIError({
                    message: `common.status.${StatusCode.BAD_REQUEST}`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`details.${ErrorKey.INVALID}`],
                });
            }
        };

        if (tx) {
            const result = await runTransaction(tx);
            // eventbus.emit(EVENT_INVENTORY_CREATED, result);
        } else {
            await this.db.$transaction(async (transaction) => {
                const result = await runTransaction(transaction);
                // eventbus.emit(EVENT_INVENTORY_CREATED, result);
            });
        }

        eventbus.emit(EVENT_CREATE_GATELOG, {
            // inventory_id: inventoryId,
            inventory: inventoryId ? { connect: { id: inventoryId } } : undefined,
            organization_id: request.organization_id,
        } as IGateLog)

        return { id: inventoryId };
    }

    public async updateInventory(id: number, request: Partial<IInventory>, isAdmin: boolean): Promise<IIdResponse> {
        const { delete: deleteIds, update, add, details, files_add, files_delete, ...body } = request;
        const inventoryData = await this.canEdit(id, 'inventory', isAdmin);

        try {
            const inventoryExist = await this.findById(id);

            await this.isExist({ code: request.code, id }, true);

            await this.validateForeignKeys(request, {
                customer_id: this.partnerRepo,
                supplier_id: this.partnerRepo,
                shipping_plan_id: this.shippingPlanRepo,
                employee_id: this.employeeRepo,
                organization_id: this.organizationRepo,
                order_id: this.orderRepo,
            });

            const isAdminEdit = isAdmin && inventoryExist?.status === CommonApproveStatus.CONFIRMED;
            console.log('isAdminEdit: ', isAdminEdit);
            // handle files
            let filesUpdate = handleFiles(files_add, files_delete, inventoryExist?.files);
            await this.db.$transaction(async (tx) => {
                const updatedInventory = await tx.inventories.update({
                    where: { id },
                    data: { ...body, ...(filesUpdate !== null && { files: filesUpdate }) },
                });

                // Gom tất cả thay đổi về TransactionWarehouses
                const transactionChanges = {
                    toCreate: [] as any[],
                    toUpdate: [] as any[],
                    toDelete: [] as number[],
                };

                // [add] order details
                let convertQtyUpdate = 0;
                if (add && add.length > 0) {
                    await this.validateForeignKeys(add, { order_detail_id: this.orderDetailRepo }, tx);

                    const data = add.map((item) => {
                        const { key, order_detail, ...rest } = item;
                        return { ...rest, inventory_id: id };
                    });
                    const createdDetails = await this.inventoryDetailRepo.createMany(data, tx);

                    // Gom transaction cần tạo
                    if (isAdminEdit) {
                        for (let i = 0; i < createdDetails.length; i++) {
                            const createdDetail = createdDetails[i];
                            const originalItem = add[i];

                            const valueConverted =
                                calculateConvertQty({
                                    ...originalItem.order_detail,
                                    quantity: createdDetail.quantity,
                                }) || 0;
                            transactionChanges.toCreate.push({
                                inventory_detail_id: createdDetail.id,
                                inventory_id: id,
                                order_id: updatedInventory.order_id,
                                warehouse_id: updatedInventory.warehouse_id,
                                product_id: originalItem?.order_detail?.product?.id || 0,
                                real_quantity: createdDetail.real_quantity,
                                quantity: createdDetail.quantity,
                                convert_quantity: valueConverted,
                                type: InventoryTypeDirectionMap[updatedInventory.type],
                                time_at: updatedInventory.time_at,
                                note: createdDetail.note,
                                organization_id: updatedInventory.organization_id,
                            });
                            convertQtyUpdate += valueConverted || 0;
                        }
                        await this.transactionWarehouseRepo.createMany(transactionChanges.toCreate, tx);
                    }
                }

                // [update] order details
                if (update && update.length > 0) {
                    await this.validateForeignKeys(
                        update,
                        {
                            id: this.inventoryDetailRepo,
                        },
                        tx,
                    );
                    const data = update.map((item) => {
                        const { key, order_detail, ...rest } = item;
                        return rest;
                    });
                    await this.inventoryDetailRepo.updateMany(data, tx);

                    if (isAdminEdit) {
                        // Gom transaction cần update
                        for (const item of update) {
                            const { key, id: detailId, ...detailData } = item;

                            const originalDetail = await this.inventoryDetailRepo.findOne({ id: detailId }, false, tx);
                            if (!originalDetail) continue;

                            // Tìm transaction tương ứng
                            const existingTransaction = await this.transactionWarehouseRepo.findOne(
                                {
                                    inventory_detail_id: detailId,
                                },
                                false,
                                tx,
                            );

                            if (existingTransaction) {
                                console.log('detailData: ', detailData);
                                console.log('originalDetail: ', detailData.order_detail);

                                const valueConverted =
                                    calculateConvertQty({
                                        ...detailData.order_detail,
                                        quantity: detailData.quantity || 0,
                                    }) || 0;
                                // const diff = valueConverted - (existingTransaction.convert_quantity || 0);
                                const diff = (detailData.quantity || 0) - (existingTransaction.quantity || 0);
                                transactionChanges.toUpdate.push({
                                    id: existingTransaction.id,
                                    real_quantity: detailData.real_quantity,
                                    quantity: detailData.quantity,
                                    convert_quantity: valueConverted,
                                    note: detailData.note,
                                    time_at: updatedInventory.time_at,
                                    // product_id: detailData.order_detail?.product?.id,
                                });

                                //    update if quantity changed
                                console.log('valueConverted: ', valueConverted);
                                console.log(
                                    'existingTransaction.convert_quantity: ',
                                    existingTransaction.convert_quantity,
                                );
                                if (
                                    detailData?.order_detail?.id &&
                                    // valueConverted !== existingTransaction.convert_quantity
                                    detailData.quantity !== existingTransaction.quantity
                                ) {
                                    await this.commonDetailService.updateImportQuantity(
                                        { id: detailData.order_detail.id },
                                        {
                                            type: 'increase',
                                            quantity: diff,
                                        },
                                        tx,
                                    );
                                }
                            }
                        }
                        if (transactionChanges.toUpdate.length > 0) {
                            await this.transactionWarehouseRepo.updateMany(transactionChanges.toUpdate, tx);
                        }
                    }
                }

                // [delete] order details
                if (deleteIds && deleteIds.length > 0) {
                    if (isAdminEdit) {
                        // const detailsToDelete = await this.inventoryDetailRepo.findMany(
                        //     { id: { in: deleteIds } },
                        //     false,
                        //     // tx,
                        // );
                        const detailsToDelete = await tx.inventoryDetails.findMany({
                            where: { id: { in: deleteIds } },
                            select: InventoryDetailSelectionProduct,
                        });

                        for (const detail of detailsToDelete) {
                            if (detail.order_detail_id) {
                                await this.commonDetailService.updateImportQuantity(
                                    { id: detail.order_detail_id },
                                    {
                                        type: 'decrease',
                                        // quantity:
                                        //     calculateConvertQty({
                                        //         ...detail.order_detail,
                                        //         quantity: detail.quantity || 0,
                                        //     }) || 0,
                                        quantity: detail.quantity || 0,
                                    },
                                    tx,
                                );
                            }
                        }
                    }
                    await this.inventoryDetailRepo.deleteMany({ id: { in: deleteIds } }, tx, false);
                }
            });

            // update is done in order
            if (inventoryExist?.order_id && isAdminEdit) {
                const orderDetails = await this.orderDetailRepo.findMany({ order_id: inventoryExist?.order_id }, true);

                let initQty: number = 0;
                if (!orderDetails || orderDetails.length === 0) initQty = 0;
                initQty = orderDetails.reduce((total, detail) => {
                    const convertedQuantity = calculateConvertQty(detail);
                    return total + convertedQuantity;
                }, 0);
                const importQty = await this.transactionWarehouseRepo.aggregate(
                    { order_id: inventoryExist?.order_id, type: 'in' },
                    {
                        _sum: {
                            convert_quantity: true,
                        },
                    },
                );
                const percent = initQty > 0 ? ((importQty?._sum?.convert_quantity || 0) / initQty) * 100 : 0;
                const orderData = await this.orderRepo.findOne({ id: inventoryData.order_id }, false);
                const isDone = percent >= 100 - (orderData?.tolerance || 0)
                await this.orderRepo.update({ id: inventoryExist?.order_id }, { delivery_progress: percent, isDone });
            }

            // clean up file
            if (files_delete && files_delete.length > 0) {
                deleteFileSystem(files_delete);
            }

            return { id };
        } catch (error) {
            if (files_add && files_add.length > 0) {
                deleteFileSystem(files_add);
            }
            throw error;
        }
    }

    private async handleApprove(id: number, inventoryData: Partial<Inventories>, tx: Prisma.TransactionClient) {
        //
        let totalInitQty = 0;
        let totalImportQty = 0;
        const warehouseTransactionData: any[] = [];
        const inventoryDetails = await tx.inventoryDetails.findMany({
            where: { inventory_id: id },
            select: InventoryDetailSelectionProduct,
        });
        for (const item of inventoryDetails) {
            if (!item.order_detail_id) continue;
            const valueConverted = calculateConvertQty({
                ...item.order_detail,
                quantity: item.quantity || 0,
            });

            const productData = (item.order_detail as any)?.product as IProduct

            warehouseTransactionData.push({
                real_quantity: item.real_quantity || 0,
                convert_quantity: valueConverted || 0,
                quantity: item.quantity || 0,
                inventory: { connect: { id: id } },
                inventory_detail: { connect: { id: item.id } },
                warehouse: { connect: { id: inventoryData.warehouse_id! } },
                order: { connect: { id: inventoryData.order_id } },
                product: { connect: { id: productData?.parent_id ? productData.parent_id : productData.id } },
                ...(productData?.parent_id && { child: { connect: { id: productData.id } } }),
                type: InventoryTypeDirectionMap[inventoryData.type as InventoryType],
                time_at: inventoryData.time_at,
            });

            // update import quantity in order details
            const qtyInfo = await this.commonDetailService.updateImportQuantity(
                { id: item.order_detail_id },
                // { type: 'increase', quantity: valueConverted },
                { type: 'increase', quantity: item.quantity || 0 },
                tx,
            );
            totalImportQty += qtyInfo?.newQty || 0;
            totalInitQty += qtyInfo?.qty || 0;
        }

        // insert data to transaction warehouse
        await this.transactionWarehouseRepo.createMany(warehouseTransactionData, tx);

        // update is done in order
        if (inventoryData.order_id) {
            const orderDetails = await this.orderDetailRepo.findMany(
                { order_id: inventoryData.order_id },
                true,
                tx,
            );
            let initQty: number = 0;
            if (!orderDetails || orderDetails.length === 0) initQty = 0;
            initQty = orderDetails.reduce((total, detail) => {
                const convertedQuantity = calculateConvertQty(detail);
                return total + convertedQuantity;
            }, 0);
            const importQty = await this.transactionWarehouseRepo.aggregate(
                { order_id: inventoryData.order_id, type: 'in' },
                {
                    _sum: {
                        convert_quantity: true,
                    },
                },
                tx,
            );
            console.log('initQty: ', initQty);
            console.log('importQty: ', importQty?._sum?.convert_quantity);
            const percent = initQty > 0 ? ((importQty?._sum?.convert_quantity || 0) / initQty) * 100 : 0;
            const orderData = await this.orderRepo.findOne({ id: inventoryData.order_id }, false, tx);
            const isDone = percent >= 100 - (orderData?.tolerance || 0)
            console.log('percent: ', percent);
            console.log('isDone: ', isDone);
            await this.orderRepo.update({ id: inventoryData.order_id }, { delivery_progress: percent, isDone }, tx);
        }
    }

    public async approve(id: number, body: IApproveRequest): Promise<IIdResponse> {
        const inventoryData = await this.validateStatusApprove(id);

        try {
            await this.db.$transaction(async (tx) => {
                await this.repo.update({ id }, body, tx);
                //
                await this.handleApprove(id, inventoryData, tx);

                // eventbus.emit(EVENT_CREATE_GATELOG, {
                //     inventory_id: id,
                //     organization_id: inventoryData.organization_id,
                // } as IGateLog)
            });

            return { id };
        } catch (error) {
            throw error;
        }
    }

    public async deleteInventory(id: number, isAdmin: boolean): Promise<IIdResponse> {
        try {
            const inventoryData = await this.canEdit(id, 'inventory', isAdmin);

            await this.db.$transaction(async (tx) => {
                const detailsToDelete = await this.inventoryDetailRepo.findMany({ inventory_id: id }, false, tx);

                for (const detail of detailsToDelete) {
                    if (detail.order_detail_id) {
                        await this.commonDetailService.updateImportQuantity(
                            { id: detail.order_detail_id },
                            {
                                type: 'decrease',
                                quantity: detail.quantity || 0,
                            },
                            tx,
                        );
                    }
                }

                await this.repo.delete({ id }, tx);
            });

            return { id };
        } catch (error) {
            throw error;
        }
    }

    public async getInventoryReport(
        query: IPaginationInput & {
            productIds?: number[];
            warehouseIds?: number[];
        },
    ) {
        const { startAt, endAt, warehouseIds, productIds } = query;

        const baseWhere = {
            ...(productIds && productIds.length > 0 && { product_id: { in: productIds } }),
            ...(warehouseIds && { warehouse_id: { in: warehouseIds } }),
        };

        const transactions = await this.db.transactionWarehouses.findMany({
            where: {
                ...baseWhere,
                time_at: { lte: endAt },
            },
            select: {
                product_id: true,
                type: true,
                // real_quantity: true,
                convert_quantity: true,
                time_at: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        unit: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                warehouse: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { time_at: 'asc' },
        });

        const productReports = new Map();

        transactions.forEach((transaction) => {
            const productId = transaction.product_id;
            if (!productId) return;

            if (!productReports.has(productId)) {
                productReports.set(productId, {
                    product: transaction.product,
                    warehouse: transaction.warehouse,
                    beforePeriodImport: 0,
                    beforePeriodExport: 0,
                    inPeriodImport: 0,
                    inPeriodExport: 0,
                    totalImport: 0,
                    totalExport: 0,
                });
            }

            const report = productReports.get(productId);
            const quantity = transaction.convert_quantity || 0;
            const startDate = startAt ? new Date(startAt) : undefined;
            const endDate = endAt ? new Date(endAt) : undefined;
            const isInPeriod =
                startDate && endDate ? transaction.time_at >= startDate && transaction.time_at <= endDate : false;
            const isBeforePeriod = startDate ? transaction.time_at < startDate : false;

            if (transaction.type === 'in') {
                report.totalImport += quantity;
                if (isInPeriod) report.inPeriodImport += quantity;
                if (isBeforePeriod) report.beforePeriodImport += quantity;
            } else if (transaction.type === 'out') {
                report.totalExport += quantity;
                if (isInPeriod) report.inPeriodExport += quantity;
                if (isBeforePeriod) report.beforePeriodExport += quantity;
            }
        });

        const reports = Array.from(productReports.values()).map((report) => ({
            product: report.product,
            warehouse: report.warehouse,
            beginning: report.beforePeriodImport - report.beforePeriodExport,
            increase: report.inPeriodImport,
            reduction: report.inPeriodExport,
            ending: report.totalImport - report.totalExport,
        }));

        return reports;

        // summary: {
        //     total_products: reports.length,
        //     total_beginning: reports.reduce((sum, r) => sum + r.beginning, 0),
        //     total_increase: reports.reduce((sum, r) => sum + r.increase, 0),
        //     total_reduction: reports.reduce((sum, r) => sum + r.reduction, 0),
        //     total_ending: reports.reduce((sum, r) => sum + r.ending, 0),
        // },
    }

    public async getInventoryReportDetail(
        query: IPaginationInput & {
            productIds?: number[];
            warehouseIds?: number[];
        },
    ) {
        const { startAt, endAt, warehouseIds, productIds } = query;

        const baseWhere = {
            ...(productIds && productIds.length > 0 && { product_id: { in: productIds } }),
            ...(warehouseIds && { warehouse_id: { in: warehouseIds } }),
        };

        const transactions = await this.db.transactionWarehouses.findMany({
            where: {
                ...baseWhere,
                time_at: { lte: endAt },
            },
            select: {
                id: true,
                product_id: true,
                warehouse_id: true,
                type: true,
                // real_quantity: true,
                convert_quantity: true,
                time_at: true,
                note: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        unit: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                warehouse: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                inventory: {
                    select: {
                        id: true,
                        type: true,
                        files: true,
                    },
                },
            },
            orderBy: { time_at: 'asc' },
        });

        if (transactions.length === 0) {
            return {
                product: null,
                warehouse: null,
                beginning: 0,
                increase: 0,
                reduction: 0,
                ending: 0,
                details: [],
            };
        }

        const firstTransaction = transactions[0];
        const product = firstTransaction.product;
        const warehouse = firstTransaction.warehouse;

        let runningBalance = 0;
        let beforePeriodImport = 0;
        let beforePeriodExport = 0;
        let inPeriodImport = 0;
        let inPeriodExport = 0;
        let totalImport = 0;
        let totalExport = 0;

        const details: any[] = [];

        transactions.forEach((transaction) => {
            const quantity = transaction.convert_quantity || 0;
            const startDate = startAt ? new Date(startAt) : undefined;
            const endDate = endAt ? new Date(endAt) : undefined;
            const isInPeriod =
                startDate && endDate ? transaction.time_at >= startDate && transaction.time_at <= endDate : false;
            const isBeforePeriod = startDate ? transaction.time_at < startDate : false;

            // Tính tồn kho tích lũy
            if (transaction.type === 'in') {
                runningBalance += quantity;
                totalImport += quantity;
                if (isInPeriod) inPeriodImport += quantity;
                if (isBeforePeriod) beforePeriodImport += quantity;
            } else if (transaction.type === 'out') {
                runningBalance -= quantity;
                totalExport += quantity;
                if (isInPeriod) inPeriodExport += quantity;
                if (isBeforePeriod) beforePeriodExport += quantity;
            }

            // Tạo detail item
            const detailItem = {
                id: transaction.id,
                time_at: transaction.time_at,
                type: transaction.inventory?.type || null,
                files: transaction.inventory?.files || [],
                transaction_type: transaction.type,
                // convert_quantity: quantity,
                beginning: isBeforePeriod ? (transaction.type === 'in' ? quantity : -quantity) : 0,
                increase: isInPeriod && transaction.type === 'in' ? quantity : 0,
                reduction: isInPeriod && transaction.type === 'out' ? quantity : 0,
                ending: runningBalance,
            };

            details.push(detailItem);
        });

        return {
            product,
            warehouse,
            beginning: beforePeriodImport - beforePeriodExport,
            increase: inPeriodImport,
            reduction: inPeriodExport,
            ending: totalImport - totalExport,
            details,
        };
    }

    public async getInventoryImportDetail(
        query: IPaginationInput & {
            productIds?: number[];
            warehouseIds?: number[];
        },
    ) {
        const { startAt, endAt, warehouseIds, productIds } = query;

        const baseWhere = {
            ...(productIds && productIds.length > 0 && { product_id: { in: productIds } }),
            ...(warehouseIds && { warehouse_id: { in: warehouseIds } }),
        };

        const data = await this.db.inventoryDetails.findMany({
            where: {
                inventory: {
                    ...((startAt || endAt) && {
                        time_at: {
                            ...(startAt && { gte: startAt }),
                            ...(endAt && { lte: endAt }),
                        },
                    }),
                    status: CommonApproveStatus.CONFIRMED,
                },
            },
            select: InventoryDetailSelectionImportDetail,
        });

        // 1. Lấy mảng unique order IDs từ inventory details
        const orderIds = [
            ...new Set(
                data.map((item) => item.inventory?.order_id).filter((orderId): orderId is number => orderId != null),
            ),
        ];

        const invoices =
            orderIds.length > 0 ? await this.db.invoices.findMany({ where: { order_id: { in: orderIds } } }) : [];

        const invoiceMap = new Map<number, any>();
        invoices.forEach((invoice) => {
            if (invoice.order_id) {
                invoiceMap.set(invoice.order_id, invoice);
            }
        });

        const result = data.map((item) => {
            const orderId = item.inventory?.order_id;
            const invoice = orderId ? invoiceMap.get(orderId) : null;

            return {
                ...item,
                invoice: invoice || null,
            };
        });

        return transformDecimal(result);
    }

    public getDifferentInventory(data: any[]): IInventoryDifferent[] {
        return data
            .map((item): IInventoryDifferent | undefined => {
                let total_different_quantity = 0;
                let total_different_money = 0;

                const { details, ...rest } = item;

                const newDetails =
                    details?.map((detail: InventoryDetail) => {
                        if (!detail) return detail;

                        const { quantity = 0, real_quantity = 0, order_detail, ...restDetail } = detail;

                        const price = order_detail?.price ?? 0;
                        const diffQty = real_quantity - quantity;
                        const diffMoney = real_quantity * price - quantity * price;

                        total_different_quantity += diffQty;
                        total_different_money += diffMoney;

                        return {
                            ...restDetail,
                            quantity,
                            real_quantity,
                            order_detail,
                            different_quantity: diffQty,
                            different_money: diffMoney,
                        };
                    }) ?? [];

                if (total_different_quantity !== 0 && total_different_money != 0) {
                    return {
                        ...rest,
                        details: newDetails,
                        total_different_quantity,
                        total_different_money,
                    };
                }

                return undefined;
            })
            .filter((item): item is IInventoryDifferent => item !== undefined);
    }

    public async different(query: IPaginationInput): Promise<IPaginationResponse> {
        // const listId = await this.inventoryDetailRepo.findMany({} as Prisma.InventoryDetailsWhereInput);
        const { supplierIds, ...restQuery } = query;
        const where: Prisma.InventoriesWhereInput = {
            ...restQuery,
            ...(supplierIds?.length > 0 && {
                order: {
                    partner_id: { in: supplierIds },
                },
            }),
        };
        let result = await this.repo.paginate(where, true);
        result.data = this.getDifferentInventory(result.data);

        const summary = await this.calculateDifferenceSummary(where);

        return {
            ...result,
            summary,
        };
    }

    private async calculateDifferenceSummary(query: IPaginationInput): Promise<{
        total_different_quantity: number;
        total_different_money: number;
    }> {
        const whereClause = this.buildWhereConditions(query);

        const sqlQuery = `
        SELECT 
            COALESCE(SUM(
                CASE 
                    WHEN (id.real_quantity - id.quantity) != 0 
                         AND ((id.real_quantity * COALESCE(od.price, 0)) - (id.quantity * COALESCE(od.price, 0))) != 0
                    THEN (id.real_quantity - id.quantity)
                    ELSE 0
                END
            ), 0) as total_different_quantity,
            COALESCE(SUM(
                CASE 
                    WHEN (id.real_quantity - id.quantity) != 0 
                         AND ((id.real_quantity * COALESCE(od.price, 0)) - (id.quantity * COALESCE(od.price, 0))) != 0
                    THEN ((id.real_quantity * COALESCE(od.price, 0)) - (id.quantity * COALESCE(od.price, 0)))
                    ELSE 0
                END
            ), 0) as total_different_money
        FROM inventories i
        INNER JOIN inventory_details id ON i.id = id.inventory_id
        LEFT JOIN common_details od ON id.order_detail_id = od.id
        LEFT JOIN orders o ON i.order_id = o.id
        ${whereClause ? `WHERE ${whereClause}` : ''}
    `;

        const result = await this.db.$queryRawUnsafe<
            Array<{
                total_different_quantity: string;
                total_different_money: string;
            }>
        >(sqlQuery);

        return {
            total_different_quantity: Number(result[0]?.total_different_quantity || 0),
            total_different_money: Number(result[0]?.total_different_money || 0),
        };
    }

    private buildWhereConditions(query: any): string {
        const conditions: string[] = [];

        if (query.keyword && query.keyword.trim() !== '') {
            const keyword = query.keyword.trim().replace(/'/g, "''");
            conditions.push(`(i.code ILIKE '%${keyword}%' OR o.code ILIKE '%${keyword}%')`);
        }

        if (query.startAt) conditions.push(`i.time_at >= '${query.startAt}'`);
        if (query.endAt) conditions.push(` i.time_at <= '${query.endAt}'`);

        if (query.supplierIds?.length > 0) conditions.push(` o.partner_id IN (${query.supplierIds.join(',')})`);

        return conditions.join(' AND ');
    }

    async updateRealQuantity(id: number, body: IInventory): Promise<IIdResponse> {
        const inventoryData = await this.findById(id);
        if (!inventoryData) return { id }

        await this.db.$transaction(async (tx) => {
            const { files, details } = body;
            // 1. update data
            // 1.1 merge files
            if (files && files.length > 0) {
                let filesUpdate = handleFiles(files, [], inventoryData?.files || []);
                await this.repo.update({ id }, { files: filesUpdate, status: CommonApproveStatus.CONFIRMED }, tx);
            }

            // 1.2 update real_quantity, note trong details
            if (details?.length > 0) {
                await this.validateForeignKeys(
                    details,
                    {
                        id: this.inventoryDetailRepo,
                    },
                    tx,
                );
                const data = details.map((item) => {
                    const { key, ...rest } = item;
                    return rest;
                });
                await this.inventoryDetailRepo.updateMany(data, tx);
                // 1.2.1 update real_quantity trong transaction warehouse
                // const transactionWhs: any[] = [];
                // for (const item of details) {
                //     const existingTrans = await this.transactionWarehouseRepo.findOne(
                //         {
                //             inventory_detail_id: item.id,
                //         },
                //         false,
                //         tx,
                //     );
                //     if (!existingTrans) {
                //         throw new APIError({
                //             message: `common.status.${StatusCode.REQUEST_NOT_FOUND}`,
                //             status: ErrorCode.NOT_FOUND,
                //             errors: [`id.${ErrorKey.NOT_FOUND}`],
                //         });
                //     }
                //     transactionWhs.push({ id: existingTrans?.id, real_quantity: item.real_quantity || 0 });
                // }
                // if (transactionWhs.length > 0) {
                //     await this.transactionWarehouseRepo.updateMany(transactionWhs, tx)
                // }
            }

            // 1.3 approve
            await this.handleApprove(id, inventoryData, tx);
        })

        return { id }
    }

    // async calculateDeliveryProgress(orderId: number | undefined, tx?: Prisma.TransactionClient, tempQty: number = 0) {
    //     const orderDetails = await this.orderDetailRepo.findMany(
    //         { order_id: orderId },
    //         true,
    //         tx,
    //     );
    //     let initQty: number = 0;
    //     if (!orderDetails || orderDetails.length === 0) initQty = 0;
    //     initQty = orderDetails.reduce((total, detail) => {
    //         const convertedQuantity = calculateConvertQty(detail);
    //         return total + convertedQuantity;
    //     }, 0);
    //     const importQty = await this.transactionWarehouseRepo.aggregate(
    //         { order_id: orderId, type: 'in' },
    //         {
    //             _sum: {
    //                 convert_quantity: true,
    //             },
    //         },
    //         tx,
    //     );
    //     const percent = initQty > 0 ? (((importQty?._sum?.convert_quantity || 0) + tempQty) / initQty) * 100 : 0;
    //     return percent;
    // }

    private async checkProductAndOrderTolerances(
        orderId: number,
        inventoryDetails: any[],
        tolerance: number,
        tx?: Prisma.TransactionClient
    ): Promise<void> {
        logger.info(`[Tolerance Check] Starting validation for order ${orderId} with tolerance ${tolerance}%`);

        const orderDetails = await this.orderDetailRepo.findMany({ order_id: orderId }, true, tx);
        logger.info(`[Tolerance Check] Found ${orderDetails.length} order details`);

        let totalValueConverted = 0;

        for (const inventoryDetail of inventoryDetails) {
            const orderDetail = orderDetails.find(od => od.id === inventoryDetail.order_detail_id);
            if (!orderDetail) {
                logger.warn(`[Tolerance Check] Order detail not found for inventory detail: ${inventoryDetail.order_detail_id}`);
                continue;
            }

            // Calculate new import quantity for this product
            const newImportQty = calculateConvertQty({
                ...orderDetail,
                quantity: inventoryDetail.quantity || 0,
            });
            totalValueConverted += newImportQty;

            logger.info(`[Tolerance Check] Product ${orderDetail.product_id}: New import qty = ${newImportQty}`);

            // Get current imported for this specific product
            const confirmedImported = await this.transactionWarehouseRepo.aggregate(
                { order_id: orderId, type: 'in', product_id: orderDetail.product_id },
                { _sum: { convert_quantity: true } },
                tx,
            );

            // Get pending inventory quantities (not yet confirmed/approved)
            const pendingInventories = await this.inventoryDetailRepo.findMany({
                order_detail_id: inventoryDetail.order_detail_id,
                inventory: {
                    status: CommonApproveStatus.PENDING,
                }
            }, false, tx);

            // Calculate pending quantity
            const pendingQty = pendingInventories.reduce((sum, item) => {
                const convertedQty = calculateConvertQty({
                    ...orderDetail,
                    quantity: item.quantity || 0,
                });
                return sum + convertedQty;
            }, 0);

            // Check individual product tolerance
            const orderQuantity = calculateConvertQty(orderDetail);
            const confirmedQty = confirmedImported?._sum?.convert_quantity || 0;
            const totalPendingAndNew = pendingQty + newImportQty;
            // const totalImported = confirmedQty + newImportQty;
            const totalAllQuantities = confirmedQty + totalPendingAndNew;
            const productProgress = orderQuantity > 0 ? (totalAllQuantities / orderQuantity) * 100 : 0;

            logger.info(`[Tolerance Check] Product ${orderDetail.product_id}:`, {
                orderQuantity,
                confirmedQty,
                newImportQty,
                totalAllQuantities,
                productProgress: `${productProgress.toFixed(2)}%`,
                toleranceLimit: `${100 + tolerance}%`,
                isExceeded: productProgress > 100 + tolerance
            });

            if (productProgress > 100 + tolerance) {
                logger.error(`[Tolerance Check] Product ${orderDetail.product_id} exceeds tolerance: ${productProgress.toFixed(2)}% > ${100 + tolerance}%`);
                throw new APIError({
                    message: `Product exceeds tolerance: ${productProgress.toFixed(2)}% > ${100 + tolerance}%`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`quantity.${inventoryDetail?.key}.exceeded`],
                });
            }
        }

        logger.info(`[Tolerance Check] Total value converted: ${totalValueConverted}`);

        // Check overall order tolerance
        // Check overall order tolerance including pending inventories
        const totalPendingForOrder = await this.calculateTotalPendingQuantity(orderId, tx);
        const orderProgress = await this.calculateDeliveryProgressWithPending(orderId, tx, totalValueConverted, totalPendingForOrder);

        logger.info(` Order validation:`, {
            totalConverted: totalValueConverted,
            totalPending: totalPendingForOrder,
            orderProgress: `${orderProgress.toFixed(2)}%`,
            toleranceLimit: `${100 + tolerance}%`,
            isExceeded: orderProgress > 100 + tolerance
        });

        if (orderProgress > 100 + tolerance) {
            logger.error(`[Tolerance Check] Order ${orderId} exceeds tolerance: ${orderProgress.toFixed(2)}% > ${100 + tolerance}%`);
            throw new APIError({
                message: `Order exceeds tolerance: ${orderProgress.toFixed(2)}% > ${100 + tolerance}%`,
                status: ErrorCode.BAD_REQUEST,
                errors: [`quantity.exceeded`],
            });
        }

        logger.info(`[Tolerance Check] ✅ Order ${orderId} passed all tolerance checks`);
    }

    private async calculateTotalPendingQuantity(orderId: number, tx?: Prisma.TransactionClient): Promise<number> {
        // Get all pending inventory details for this order
        const pendingInventories = await this.inventoryDetailRepo.findMany({
            inventory: {
                order_id: orderId,
                status: CommonApproveStatus.PENDING
            }
        }, true, tx);

        let totalPending = 0;
        for (const item of pendingInventories) {
            if ((item as any)?.order_detail) {
                const convertedQty = calculateConvertQty({
                    ...(item as any)?.order_detail,
                    quantity: item.quantity || 0,
                });
                totalPending += convertedQty;
            }
        }

        return totalPending;
    }

    private async calculateDeliveryProgressWithPending(
        orderId: number,
        tx?: Prisma.TransactionClient,
        newQty: number = 0,
        pendingQty: number = 0
    ): Promise<number> {
        const orderDetails = await this.orderDetailRepo.findMany(
            { order_id: orderId },
            true,
            tx,
        );

        let initQty: number = 0;
        if (orderDetails && orderDetails.length > 0) {
            initQty = orderDetails.reduce((total, detail) => {
                const convertedQuantity = calculateConvertQty(detail);
                return total + convertedQuantity;
            }, 0);
        }

        // Get confirmed imported quantity
        const confirmedImported = await this.transactionWarehouseRepo.aggregate(
            { order_id: orderId, type: 'in' },
            {
                _sum: {
                    convert_quantity: true,
                },
            },
            tx,
        );

        const confirmedQty = confirmedImported?._sum?.convert_quantity || 0;
        const totalWithPendingAndNew = confirmedQty + pendingQty + newQty;

        const percent = initQty > 0 ? (totalWithPendingAndNew / initQty) * 100 : 0;
        return percent;
    }
}
