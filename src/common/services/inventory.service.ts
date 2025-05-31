import { BaseService } from './base.service';
import { Inventories, Prisma } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { calculateConvertQty } from '@common/helpers/calculate-convert-qty';
import {
    IApproveRequest,
    IIdResponse,
    IPaginationInput,
    IUpdateChildAction,
} from '@common/interfaces/common.interface';
import { IInventory, InventoryDetail } from '@common/interfaces/inventory.interface';
import { ITransactionWarehouse } from '@common/interfaces/transaction-warehouse.interface';
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
    InventoryDetailSelectionImportDetail,
    InventoryDetailSelectionProduct,
} from '@common/repositories/prisma/inventory-detail.select';
import { transformDecimal } from '@common/helpers/transform.util';
import { ShippingPlanRepo } from '@common/repositories/shipping-plan.repo';

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
    private commonDetailService: CommonDetailService = CommonDetailService.getInstance();

    private constructor() {
        super(new InventoryRepo());
    }

    public static getInstance(): InventoryService {
        if (!this.instance) {
            this.instance = new InventoryService();
        }
        return this.instance;
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
                order_id: this.orderRepo,
                warehouse_id: this.warehouseRepo,
            },
            tx,
        );

        let dataImportInOrder: Record<number, number> = {};
        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const { details, ...inventoryData } = request;

            inventoryId = await this.repo.create(inventoryData as Partial<Inventories>, transaction);

            if (details && details.length > 0) {
                await this.validateForeignKeys(details, { order_detail_id: this.orderDetailRepo }, transaction);

                const dataDetails = details.map((item) => {
                    const { key, order_detail, ...rest } = item;

                    if (!dataImportInOrder[item.order_detail_id]) {
                        dataImportInOrder[item.order_detail_id] = rest.real_quantity || 0;
                    } else {
                        dataImportInOrder[item.order_detail_id] += rest.real_quantity || 0;
                    }

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
                                const diff = valueConverted - (existingTransaction.convert_quantity || 0);
                                console.log('diff: ', diff);
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
                                    valueConverted !== existingTransaction.convert_quantity
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
                                        quantity:
                                            calculateConvertQty({
                                                ...detail.order_detail,
                                                quantity: detail.quantity || 0,
                                            }) || 0,
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
                await this.orderRepo.update({ id: inventoryExist?.order_id }, { delivery_progress: percent });
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

    public async approve(id: number, body: IApproveRequest): Promise<IIdResponse> {
        const inventoryData = await this.validateStatusApprove(id);

        try {
            await this.db.$transaction(async (tx) => {
                await this.repo.update({ id }, body, tx);
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

                    warehouseTransactionData.push({
                        real_quantity: item.real_quantity || 0,
                        convert_quantity: valueConverted || 0,
                        quantity: item.quantity || 0,
                        inventory: { connect: { id: id } },
                        inventory_detail: { connect: { id: item.id } },
                        warehouse: { connect: { id: inventoryData.warehouse_id! } },
                        order: { connect: { id: inventoryData.order_id } },
                        product: { connect: { id: (item.order_detail as any)?.product?.id } },
                        type: InventoryTypeDirectionMap[inventoryData.type as InventoryType],
                        time_at: inventoryData.time_at,
                    });

                    // update import quantity in order details
                    const qtyInfo = await this.commonDetailService.updateImportQuantity(
                        { id: item.order_detail_id },
                        { type: 'increase', quantity: valueConverted },
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
                    console.log('percent: ', percent);
                    await this.orderRepo.update({ id: inventoryData.order_id }, { delivery_progress: percent }, tx);
                }
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
}
