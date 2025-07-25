import { BaseService } from './master/base.service';
import { Inventories, Prisma } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import {
    calculateConvertQty,
    calculateFIFOExportValue,
    getConversionRate,
} from '@common/helpers/calculate-convert-qty';
import {
    IApproveRequest,
    IIdResponse,
    IPaginationInput,
    IPaginationResponse,
} from '@common/interfaces/common.interface';
import {
    IEventInventoryApproved,
    IInventory,
    IInventoryDifferent,
    InventoryDetail,
} from '@common/interfaces/inventory.interface';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { InventoryDetailRepo } from '@common/repositories/inventory-detail.repo';
import { InventoryRepo } from '@common/repositories/inventory.repo';
import { OrderRepo } from '@common/repositories/order.repo';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { TransactionWarehouseRepo } from '@common/repositories/transaction-warehouse.repo';
import { WarehouseRepo } from '@common/repositories/warehouse.repo';
import {
    CommonApproveStatus,
    InventoryType,
    InventoryTypeDirectionMap,
    InventoryTypeIn,
    InventoryTypeOut,
    OrderType,
    ShippingPlanStatus,
    TransactionOrderType,
    TransactionType,
} from '@config/app.constant';
import { CommonDetailService } from './common-detail.service';
import { handleFiles } from '@common/helpers/handle-files';
import { transformDecimal } from '@common/helpers/transform.util';
import { ShippingPlanRepo } from '@common/repositories/shipping-plan.repo';
import eventbus from '@common/eventbus';
import {
    EVENT_CREATE_GATELOG,
    EVENT_DELETE_UNUSED_FILES,
    EVENT_DISABLE_UPDATE_INVENTORY,
    EVENT_INVENTORY_APPROVED,
} from '@config/event.constant';
import { IGateLog } from '@common/interfaces/gate-log.interface';
import { IProduct } from '@common/interfaces/product.interface';
import { CommonService } from './common.service';
import logger from '@common/logger';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { TimeAdapter } from '@common/infrastructure/time.adapter';
import { ICreateStockTracking } from '@common/interfaces/stock-tracking.interface';
import { StockTrackingService } from './master/stock-tracking.service';
import {
    CommonDetailSelectionAll,
    InventoryDetailSelectionAll,
    InventoryDetailSelectionImportDetail,
    InventoryDetailSelectionProduct,
    InventorySelection,
    OrderSelectionDetails,
    OrderSelectionPartner,
} from '@common/repositories/prisma/prisma.select';
import { TransactionWarehouseService } from './transaction-warehouse.service';
import { OrderService } from './order.service';
import { IOrder } from '@common/interfaces/order.interface';

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
    private stockTrackingService: StockTrackingService = StockTrackingService.getInstance();
    private transactionRepo: TransactionRepo = new TransactionRepo();
    private transWService: TransactionWarehouseService = TransactionWarehouseService.getInstance();
    private orderService: OrderService = OrderService.getInstance();

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

        result.data = result.data.map((item: any) => {
            return {
                ...item,
                order: {
                    ...item?.order,
                    details: item?.order?.details.map((detail: any) => ({
                        ...detail,
                        product: CommonService.transformProductDataStock(detail.product || {}),
                    })),
                },
            };
        });

        return result;
    }

    public async findById(id: number) {
        const data = (await this.repo.findOne({ id }, true)) as IInventory;

        if (!data) {
            throw new APIError({
                message: 'common.not-found',
                status: ErrorCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }

        return {
            ...data,
            order: data.order
                ? {
                    ...data.order,
                    details: (data?.order?.details || []).map((detail) => ({
                        ...detail,
                        product: CommonService.transformProductDataStock(detail.product as any),
                    })),
                }
                : undefined,
        } as any;
    }

    public async createInventory(request: Partial<IInventory>, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        let inventoryId: number = 0;

        await this.isExist({ code: request.code });

        await this.validateForeignKeys(
            request,
            {
                customer_id: this.partnerRepo,
                supplier_id: this.partnerRepo,
                delivery_id: this.partnerRepo,
                shipping_plan_id: this.shippingPlanRepo,
                employee_id: this.employeeRepo,
                organization_id: this.organizationRepo,
                order_id: this.orderRepo,
                warehouse_id: this.warehouseRepo,
            },
            tx,
        );

        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const { details, order_id, type, warehouse_id, ...inventoryData } = request;

            // check dung sai
            const existingOrder = await this.orderRepo.findOne({ id: order_id }, false, transaction);
            const tolerance = existingOrder?.tolerance || 0;

            if (details && details.length > 0) {
                if (type && (InventoryTypeIn as any).includes(type) && details && details.length > 0 && warehouse_id) {
                    // need fix this function
                    // await this.validateStockForExport(details, warehouse_id, transaction);
                    await this.checkProductAndOrderTolerances(order_id || 0, details, tolerance, transaction);
                }
            }

            // Kiểm tra tồn kho cho phiếu xuất kho
            if (type && (InventoryTypeOut as any).includes(type) && details && details.length > 0 && warehouse_id) {
                // need fix this function
                // await this.validateStockForExport(details, warehouse_id, transaction);
            }

            let content = '';

            if (details && details.length > 0) {
                content = await CommonService.getContent(details);
            }

            const body = this.autoMapConnection([{ order_id, type, warehouse_id, ...inventoryData }]);

            inventoryId = await this.repo.create(body[0] as Partial<Inventories>, transaction);

            if (details && details.length > 0) {
                await this.validateForeignKeys(details, { order_detail_id: this.orderDetailRepo }, transaction);

                const mappedDetails = this.autoMapConnection(details, {
                    inventory_id: inventoryId,
                });

                await this.inventoryDetailRepo.createMany(mappedDetails, transaction);
            } else {
                throw new APIError({
                    message: `common.status.${StatusCode.BAD_REQUEST}`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`details.${ErrorKey.INVALID}`],
                });
            }
        };

        if (tx) {
            await runTransaction(tx);
        } else {
            await this.db.$transaction(async (transaction) => {
                await runTransaction(transaction);
            });
        }

        eventbus.emit(EVENT_CREATE_GATELOG, {
            inventory: inventoryId ? { connect: { id: inventoryId } } : undefined,
            organization_id: request.organization_id,
        } as IGateLog);

        return { id: inventoryId };
    }

    private async processFIFOExportV2(inventoryDetails: InventoryDetail[], tx: Prisma.TransactionClient) {
        for (const detail of inventoryDetails) {
            const inventoryDetailData = await tx.inventoryDetails.findFirst({
                where: { id: detail.id },
                select: InventoryDetailSelectionImportDetail,
            });
            if (!inventoryDetailData) continue;

            const inventoryDetail = {
                ...inventoryDetailData,
                order_detail: {
                    ...inventoryDetailData.order_detail,
                    product: CommonService.transformProductDataStock(
                        (inventoryDetailData?.order_detail as any)?.product as any,
                    ),
                },
            };

            const product = (inventoryDetail.order_detail as any)?.product as IProduct;
            if (!product) continue;

            const { id: inventoryDetailId, real_quantity, inventory } = inventoryDetail;
            const warehouseId = inventory?.warehouse_id || 0;
            if (!warehouseId) continue;

            try {
                const { money, transactionWarehouses, stockTrackingUpdates, stockTrackingsToDelete } =
                    calculateFIFOExportValue(product, real_quantity);

                // 1. create transaction warehouses
                const transferTransW = transactionWarehouses.map((t: any) => ({
                    ...t,
                    warehouse_id: warehouseId,
                    inventory_detail_id: inventoryDetailId,
                    time_at: inventory?.time_at,
                    order_id: inventory?.order_id,
                    inventory_id: inventory?.id,
                }));
                await this.transWService.createMany(transferTransW, tx);

                // 2. delete stock trackings with zero balance
                await this.stockTrackingService.deleteMany(stockTrackingsToDelete, tx);

                // 3. update stock tracking balances
                for (const update of stockTrackingUpdates) {
                    const { id, current_balance } = update;
                    await this.stockTrackingService.updateItem(id, { current_balance }, tx);
                }

                // 4. update inventory detail with money
                await this.inventoryDetailRepo.update({ id: inventoryDetailId }, { real_money: money }, tx);
            } catch (error) {
                throw new APIError({
                    message: `FIFO Export Error:`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`product_id.insufficient_stock`],
                });
            }
        }
    }

    public async updateInventory(id: number, request: Partial<IInventory>, isAdmin: boolean): Promise<IIdResponse> {
        const { delete: deleteIds, update, add, details, files_add, files_delete, ...body } = request;

        const inventoryData = await this.canEdit(id, 'inventory', isAdmin, true);

        // Check if inventory is confirmed and restrict editing after 90 days
        const confirmedAt = TimeAdapter.parseToDate(inventoryData.confirmed_at).getTime();
        const now = TimeAdapter.getCurrentDate().getTime();
        const diffDays = Math.floor((now - confirmedAt) / (1000 * 60 * 60 * 24));

        if (diffDays >= 90 && !inventoryData.is_update_locked) {
            eventbus.emit(EVENT_DISABLE_UPDATE_INVENTORY, { id: inventoryData.id });
            throw new APIError({
                message: `common.status.edit-restriction-warning`,
                status: ErrorCode.BAD_REQUEST,
                errors: [`inventory.${ErrorKey.CANNOT_EDIT}`],
            });
        }

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
            // handle files
            let filesUpdate = handleFiles(files_add, files_delete, inventoryExist?.files);
            await this.db.$transaction(async (tx) => {
                const updatedInventory = await tx.inventories.update({
                    where: { id },
                    data: Object.fromEntries(
                        Object.entries({ ...body, ...(filesUpdate !== null && { files: filesUpdate }) }).filter(
                            ([_, v]) => v !== undefined,
                        ),
                    ),
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
                    const createdDetails = await this.inventoryDetailRepo.createMany(data, tx); // Gom transaction cần tạo
                    if (isAdminEdit) {
                        for (let i = 0; i < createdDetails.length; i++) {
                            const createdDetail = createdDetails[i];
                            const originalItem = add[i];

                            // Xử lý theo loại inventory (in/out)
                            let finalQuantity = createdDetail.quantity;
                            let finalRealQuantity = createdDetail.real_quantity;

                            if (updatedInventory.type && (InventoryTypeOut as any).includes(updatedInventory.type)) {
                                // Phiếu xuất kho: xử lý logic riêng
                                if (createdDetail.real_quantity !== null && createdDetail.real_quantity !== undefined) {
                                    // Nếu có real_quantity thì lấy giá trị của real_quantity
                                    finalQuantity = createdDetail.real_quantity;
                                    finalRealQuantity = createdDetail.real_quantity;
                                } else {
                                    // Nếu không có real_quantity thì quantity = quantity - quantity_adjustment
                                    const adjustmentQty = createdDetail.quantity_adjustment || 0;
                                    finalQuantity = (createdDetail.quantity || 0) - adjustmentQty;
                                    finalRealQuantity = finalQuantity;
                                }
                            }

                            const valueConverted =
                                calculateConvertQty({
                                    ...originalItem.order_detail,
                                    quantity: finalQuantity,
                                }) || 0;
                            transactionChanges.toCreate.push({
                                inventory_detail_id: createdDetail.id,
                                inventory_id: id,
                                order_id: updatedInventory.order_id,
                                warehouse_id: updatedInventory.warehouse_id,
                                product_id: originalItem?.order_detail?.product?.id || 0,
                                real_quantity: finalRealQuantity,
                                quantity: finalQuantity,
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
                                // Xử lý theo loại inventory (in/out)
                                let finalQuantity = detailData.quantity || 0;
                                let finalRealQuantity = detailData.real_quantity;

                                if (
                                    updatedInventory.type &&
                                    (InventoryTypeOut as any).includes(updatedInventory.type)
                                ) {
                                    // Phiếu xuất kho: xử lý logic riêng
                                    if (detailData.real_quantity !== null && detailData.real_quantity !== undefined) {
                                        // Nếu có real_quantity thì lấy giá trị của real_quantity
                                        finalQuantity = detailData.real_quantity;
                                        finalRealQuantity = detailData.real_quantity;
                                    } else {
                                        // Nếu không có real_quantity thì quantity = quantity - quantity_adjustment
                                        const adjustmentQty = detailData.quantity_adjustment || 0;
                                        finalQuantity = (detailData.quantity || 0) - adjustmentQty;
                                        finalRealQuantity = finalQuantity;
                                    }
                                }

                                const valueConverted =
                                    calculateConvertQty({
                                        ...detailData.order_detail,
                                        quantity: finalQuantity,
                                    }) || 0;
                                // const diff = valueConverted - (existingTransaction.convert_quantity || 0);
                                const diff = finalQuantity - (existingTransaction.quantity || 0);
                                transactionChanges.toUpdate.push({
                                    id: existingTransaction.id,
                                    real_quantity: finalRealQuantity,
                                    quantity: finalQuantity,
                                    convert_quantity: valueConverted,
                                    note: detailData.note,
                                    time_at: updatedInventory.time_at,
                                    // product_id: detailData.order_detail?.product?.id,
                                });

                                //    update if quantity changed
                                if (
                                    detailData?.order_detail?.id &&
                                    // valueConverted !== existingTransaction.convert_quantity
                                    finalQuantity !== existingTransaction.quantity
                                ) {
                                    // Đối với phiếu xuất kho, cần update theo hướng ngược lại
                                    const updateType = (InventoryTypeOut as any).includes(updatedInventory.type)
                                        ? 'decrease'
                                        : 'increase';
                                    const updateQuantity = Math.abs(diff);

                                    await this.commonDetailService.updateImportQuantity(
                                        { id: detailData.order_detail.id },
                                        {
                                            type:
                                                diff > 0
                                                    ? updateType
                                                    : updateType === 'increase'
                                                        ? 'decrease'
                                                        : 'increase',
                                            quantity: updateQuantity,
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
                                // Xử lý theo loại inventory (in/out)
                                let finalQuantity = detail.quantity || 0;

                                if (
                                    updatedInventory.type &&
                                    (InventoryTypeOut as any).includes(updatedInventory.type)
                                ) {
                                    // Phiếu xuất kho: xử lý logic riêng
                                    if (detail.real_quantity !== null && detail.real_quantity !== undefined) {
                                        // Nếu có real_quantity thì lấy giá trị của real_quantity
                                        finalQuantity = detail.real_quantity;
                                    } else {
                                        // Nếu không có real_quantity thì quantity = quantity - quantity_adjustment
                                        const adjustmentQty = detail.quantity_adjustment || 0;
                                        finalQuantity = (detail.quantity || 0) - adjustmentQty;
                                    }
                                }

                                // Đối với phiếu xuất kho khi delete, cần update ngược lại (increase thay vì decrease)
                                const updateType =
                                    updatedInventory.type && (InventoryTypeOut as any).includes(updatedInventory.type)
                                        ? 'increase'
                                        : 'decrease';

                                await this.commonDetailService.updateImportQuantity(
                                    { id: detail.order_detail_id },
                                    {
                                        type: updateType,
                                        quantity: finalQuantity,
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
                const isDone = percent >= 100 - (orderData?.tolerance || 0);
                await this.orderRepo.update({ id: inventoryExist?.order_id }, { delivery_progress: percent, isDone });
            }

            // clean up file
            if (files_delete && files_delete.length > 0) {
                eventbus.emit(EVENT_DELETE_UNUSED_FILES, files_delete);
            }

            return { id };
        } catch (error) {
            if (files_add && files_add.length > 0) {
                eventbus.emit(EVENT_DELETE_UNUSED_FILES, files_add);
            }
            throw error;
        }
    }

    private async handleApprove(id: number, inventoryData: Partial<Inventories>, tx: Prisma.TransactionClient) {
        let totalInitQty = 0;
        let totalImportQty = 0;
        const warehouseTransactionData: any[] = [];

        const inventoryDetails = await tx.inventoryDetails.findMany({
            where: { inventory_id: id },
            select: InventoryDetailSelectionProduct,
        });

        for (const item of inventoryDetails) {
            if (!item.order_detail_id) continue;

            // Xử lý theo loại inventory (in/out)
            let finalQuantity = item.quantity || 0;
            let finalRealQuantity = item.real_quantity || 0;

            if (inventoryData.type && (InventoryTypeOut as any).includes(inventoryData.type)) {
                // Phiếu xuất kho: xử lý logic riêng
                if (item.real_quantity !== null && item.real_quantity !== undefined) {
                    // Nếu có real_quantity thì lấy giá trị của real_quantity
                    finalQuantity = item.real_quantity;
                    finalRealQuantity = item.real_quantity;
                } else {
                    // Nếu không có real_quantity thì quantity = quantity - quantity_adjustment
                    const adjustmentQty = item.quantity_adjustment || 0;
                    finalQuantity = (item.quantity || 0) - adjustmentQty;
                    finalRealQuantity = finalQuantity;
                }
            }

            const valueConverted = calculateConvertQty({
                ...item.order_detail,
                quantity: finalRealQuantity,
            });

            const productData = (item.order_detail as any)?.product as IProduct;
            const unitData = (item.order_detail as any)?.unit as any;
            const productId = productData.parent_id || productData.id;
            const childId = productData.parent_id ? productData.id : undefined;
            const orderDetailPrice = Number(item.order_detail?.price);

            warehouseTransactionData.push({
                real_quantity: finalRealQuantity,
                convert_quantity: valueConverted || 0,
                quantity: finalQuantity,
                inventory: { connect: { id: id } },
                inventory_detail: { connect: { id: item.id } },
                warehouse: { connect: { id: inventoryData.warehouse_id! } },
                order: { connect: { id: inventoryData.order_id } },
                product: { connect: { id: productId } },
                ...(productData?.parent_id && { child: { connect: { id: productData.id } } }),
                type: InventoryTypeDirectionMap[inventoryData.type as InventoryType],
                time_at: inventoryData.time_at,

                // more
                current_balance: valueConverted,
                product_id: productId,
                child_id: childId,
                warehouse_id: inventoryData.warehouse_id || 0,
                price: orderDetailPrice / getConversionRate(productData, unitData),
            });
            // Đối với phiếu xuất kho, cần update theo hướng ngược lại
            const updateType = (InventoryTypeOut as any).includes(inventoryData.type) ? 'decrease' : 'increase';
            const qtyInfo = await this.commonDetailService.updateImportQuantity(
                { id: item.order_detail_id },
                { type: updateType, quantity: finalQuantity },
                tx,
            );
            totalImportQty += qtyInfo?.newQty || 0;
            totalInitQty += qtyInfo?.qty || 0;
        }

        await this.transactionWarehouseRepo.deleteMany({ inventory_id: id }, tx);

        // insert data to transaction warehouse
        let stockTrackingData: ICreateStockTracking[] = [];
        for (const transactionData of warehouseTransactionData) {
            const { product_id, child_id, warehouse_id, current_balance, ...restData } = transactionData;
            const transW = await tx.transactionWarehouses.create({ data: restData });
            stockTrackingData.push({
                product_id,
                child_id,
                warehouse_id,
                price: restData.price,
                current_balance,
                transaction_warehouse_id: transW.id,
                time_at: transW.time_at,
            });
        }

        // update is done in order
        if (inventoryData.order_id) {
            const orderInfo = await tx.orders.findFirst({
                where: { id: inventoryData.order_id },
                select: OrderSelectionDetails,
            });
            if (!orderInfo) return;
            const orderDetails = orderInfo?.details || [];

            const initQty =
                orderDetails.reduce((total, detail) => {
                    const convertedQuantity = calculateConvertQty(detail);
                    return total + convertedQuantity;
                }, 0) || 0;
            const sumQty = await this.transWService.sumQtyByOrder(orderInfo as any, tx);
            await this.orderService.calculateAndUpdateOrderProcessing(orderInfo as any, sumQty, initQty, tx);

            // update shipping plan if exists
            const shippingPlans = await this.shippingPlanRepo.findMany(
                { order_id: inventoryData.order_id, status: ShippingPlanStatus.CONFIRMED },
                false,
                tx,
            );

            for (const spl of shippingPlans) {
                const updateConditions: Prisma.ShippingPlansUpdateInput = {
                    completed_quantity: Number(spl.completed_quantity) + 1,
                };

                // khong co hoa don va hoan thanh het => Tao phat sinh tang trong cong no van chuyen
                if (spl.vat === 0 && Number(spl.completed_quantity) === Number(spl.quantity) - 1) {
                    const totalPrice = Number(spl.price) * Number(spl.quantity);
                    await this.transactionRepo.create(
                        {
                            type: TransactionType.OUT,
                            order_type: TransactionOrderType.DELIVERY,
                            amount: totalPrice,
                            shipping_plan: { connect: { id: spl.id } },
                            time_at: inventoryData.time_at,
                            organization: { connect: { id: inventoryData.organization_id } },
                            partner: { connect: { id: spl.partner_id } },
                            order: { connect: { id: spl.order_id } },
                            note: 'Phát sinh tăng công nợ trong quá trình vận chuyển không có VAT',
                        },
                        tx,
                    );
                    updateConditions.is_done = true;
                }

                await this.shippingPlanRepo.update({ id: spl.id }, updateConditions, tx);
                logger.info(
                    `Shipping plan ${spl.id} updated with completed quantity: ${updateConditions.completed_quantity}`,
                );
            }
        }

        await this.stockTrackingService.createMany(stockTrackingData, tx);
    }

    public async approve(id: number, body: IApproveRequest): Promise<IIdResponse> {
        const inventoryData = await this.validateStatusApprove(id);

        const inventories = await this.repo.findOne({ id }, false);

        if (inventories && inventories.type && (InventoryTypeOut as any).includes(inventories.type)) {
            await this.approveExportInventory(id, body);
        } else {
            try {
                await this.db.$transaction(async (tx) => {
                    await this.repo.update({ id }, body, tx);
                    await this.handleApprove(id, inventoryData, tx);
                });
            } catch (error) {
                throw error;
            }
        }

        eventbus.emit(EVENT_INVENTORY_APPROVED, { id, status: body.status } as IEventInventoryApproved);

        return { id };
    }

    public async deleteInventory(id: number, isAdmin: boolean): Promise<IIdResponse> {
        try {
            await this.canEdit(id, 'inventory', isAdmin);

            await this.db.$transaction(async (tx) => {
                const detailsToDelete = await this.inventoryDetailRepo.findMany({ inventory_id: id }, false, tx);

                // Lấy thông tin inventory để biết type
                const inventory = await this.repo.findOne({ id }, false, tx);

                for (const detail of detailsToDelete) {
                    if (detail.order_detail_id) {
                        // Xử lý theo loại inventory (in/out)
                        let finalQuantity = detail.quantity || 0;

                        if (inventory?.type && (InventoryTypeOut as any).includes(inventory.type)) {
                            // Phiếu xuất kho: xử lý logic riêng
                            if (detail.real_quantity !== null && detail.real_quantity !== undefined) {
                                // Nếu có real_quantity thì lấy giá trị của real_quantity
                                finalQuantity = detail.real_quantity;
                            } else {
                                // Nếu không có real_quantity thì quantity = quantity - quantity_adjustment
                                const adjustmentQty = detail.quantity_adjustment || 0;
                                finalQuantity = (detail.quantity || 0) - adjustmentQty;
                            }
                        }

                        // Đối với phiếu xuất kho khi delete, cần update ngược lại (increase thay vì decrease)
                        const updateType =
                            inventory?.type && (InventoryTypeOut as any).includes(inventory.type)
                                ? 'increase'
                                : 'decrease';

                        await this.commonDetailService.updateImportQuantity(
                            { id: detail.order_detail_id },
                            {
                                type: updateType,
                                quantity: finalQuantity,
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
                price: true,
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

                    beforePeriodImportMoney: 0,
                    beforePeriodExportMoney: 0,
                    inPeriodImportMoney: 0,
                    inPeriodExportMoney: 0,
                    totalImportMoney: 0,
                    totalExportMoney: 0,
                });
            }

            const report = productReports.get(productId);
            const quantity = transaction.convert_quantity || 0;
            const price = transaction.price || 0;
            const money = quantity * price;
            const startDate = startAt ? new Date(startAt) : undefined;
            const endDate = endAt ? new Date(endAt) : undefined;
            const isInPeriod =
                startDate && endDate ? transaction.time_at >= startDate && transaction.time_at <= endDate : false;
            const isBeforePeriod = startDate ? transaction.time_at < startDate : false;

            if (transaction.type === 'in') {
                report.totalImport += quantity;
                if (isInPeriod) report.inPeriodImport += quantity;
                if (isBeforePeriod) report.beforePeriodImport += quantity;

                // Money
                report.totalImportMoney += money;
                report.totalImportValue += money;
                if (isInPeriod) report.inPeriodImportMoney += money;
                if (isBeforePeriod) report.beforePeriodImportMoney += money;
            } else if (transaction.type === 'out') {
                report.totalExport += quantity;
                if (isInPeriod) report.inPeriodExport += quantity;
                if (isBeforePeriod) report.beforePeriodExport += quantity;

                // Money
                report.totalExportMoney += money;
                report.totalExportValue += money;
                if (isInPeriod) report.inPeriodExportMoney += money;
                if (isBeforePeriod) report.beforePeriodExportMoney += money;
            }
        });

        const reports = Array.from(productReports.values()).map((report) => {
            const beginningQty = report.beforePeriodImport - report.beforePeriodExport;
            const increaseQty = report.inPeriodImport;
            const reductionQty = report.inPeriodExport;
            const endingQty = report.totalImport - report.totalExport;

            const beginningMoney = report.beforePeriodImportMoney - report.beforePeriodExportMoney;
            const increaseMoney = report.inPeriodImportMoney;
            const reductionMoney = report.inPeriodExportMoney;
            const endingMoney = report.totalImportMoney - report.totalExportMoney;

            return {
                product: report.product,
                warehouse: report.warehouse,

                beginning: beginningQty,
                increase: increaseQty,
                reduction: reductionQty,
                ending: endingQty,

                beginning_money: Math.round(beginningMoney),
                increase_money: Math.round(increaseMoney),
                reduction_money: Math.round(reductionMoney),
                ending_money: Math.round(endingMoney),
            };
        });

        return {
            data: reports,
            summary: {
                // Quantity summary
                beginning: reports.reduce((sum, r) => sum + r.beginning, 0),
                increase: reports.reduce((sum, r) => sum + r.increase, 0),
                reduction: reports.reduce((sum, r) => sum + r.reduction, 0),
                ending: reports.reduce((sum, r) => sum + r.ending, 0),

                // ✅ Money summary
                beginning_money: reports.reduce((sum, r) => sum + r.beginning_money, 0),
                increase_money: reports.reduce((sum, r) => sum + r.increase_money, 0),
                reduction_money: reports.reduce((sum, r) => sum + r.reduction_money, 0),
                ending_money: reports.reduce((sum, r) => sum + r.ending_money, 0),
            },
        };
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
        const { startAt, endAt, warehouseIds, productIds, keyword } = query;

        // Xây dựng where condition
        let whereCondition: any = {
            inventory: {
                ...((startAt || endAt) && {
                    time_at: {
                        ...(startAt && { gte: startAt }),
                        ...(endAt && { lte: endAt }),
                    },
                }),
                status: CommonApproveStatus.CONFIRMED,
                // Filter theo warehouse
                ...(warehouseIds &&
                    warehouseIds.length > 0 && {
                    warehouse_id: { in: warehouseIds },
                }),
            },
            // Filter theo product
            ...(productIds &&
                productIds.length > 0 && {
                order_detail: {
                    product_id: { in: productIds },
                },
            }),
        }; // Bổ sung search by keyword
        if (keyword && keyword.trim()) {
            const keywordTrim = keyword.trim();
            const baseInventoryCondition = whereCondition.inventory;
            const baseDetailCondition = whereCondition.order_detail || {};

            whereCondition = {
                AND: [
                    // Áp dụng các filter cơ bản (time, status, warehouse, product)
                    whereCondition,
                    // Thêm điều kiện search
                    {
                        OR: [
                            // Tìm kiếm theo mã inventory
                            {
                                inventory: {
                                    ...baseInventoryCondition,
                                    code: {
                                        contains: keywordTrim,
                                        mode: 'insensitive',
                                    },
                                },
                                ...(productIds &&
                                    productIds.length > 0 && {
                                    order_detail: baseDetailCondition,
                                }),
                            },
                            // Tìm kiếm theo tên sản phẩm
                            {
                                inventory: baseInventoryCondition,
                                order_detail: {
                                    ...baseDetailCondition,
                                    product: {
                                        name: {
                                            contains: keywordTrim,
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                            // Tìm kiếm theo mã sản phẩm
                            {
                                inventory: baseInventoryCondition,
                                order_detail: {
                                    ...baseDetailCondition,
                                    product: {
                                        code: {
                                            contains: keywordTrim,
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                        ],
                    },
                ],
            };
        }

        const data = await this.db.inventoryDetails.findMany({
            where: whereCondition,
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

        let result = data.map((item) => {
            const orderId = item.inventory?.order_id;
            const invoice = orderId ? invoiceMap.get(orderId) : null;

            return {
                ...item,
                invoice: invoice || null,
            };
        });

        result = result.map((item) => {
            const { real_quantity, order_detail } = item;
            const price = Number(order_detail?.price ?? 0);
            const real_money = (real_quantity ?? 0) * price;
            const money = Number(order_detail?.quantity ?? 0) * price;
            return {
                ...item,
                real_money,
                money,
            };
        });

        // sort by time_at
        result.sort((a, b) => {
            const timeA = new Date(a.inventory?.time_at || 0).getTime();
            const timeB = new Date(b.inventory?.time_at || 0).getTime();
            return timeB - timeA;
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
        const { supplierIds, page, size, keyword, startAt, endAt, ...restQuery } = query;

        const timeAtFilter: Prisma.DateTimeFilter = {};
        if (startAt) timeAtFilter.gte = TimeAdapter.parseStartOfDayDate(startAt).toISOString();
        if (endAt) timeAtFilter.lte = TimeAdapter.parseEndOfDayDate(endAt).toISOString();

        const where: Prisma.InventoriesWhereInput = {
            ...restQuery,
            ...(Object.keys(timeAtFilter).length > 0 && {
                time_at: timeAtFilter,
            }),
            ...(supplierIds?.length > 0 && {
                order: {
                    partner_id: { in: supplierIds },
                },
            }),
        };

        let result = await this.db.inventories.findMany({
            where,
            select: {
                ...InventorySelection,
                order: {
                    select: OrderSelectionPartner,
                },
                details: {
                    select: InventoryDetailSelectionProduct,
                },
            },
        });

        result = this.getDifferentInventory(result) as any;

        const paginated = this.manualPaginate(result, page, size);

        const summary = this.calculateDifferenceSummary(result);

        return {
            ...paginated,
            summary,
        };
    }

    private calculateDifferenceSummary(data: any[]) {
        const total_different_quantity = data.reduce((total, item) => {
            return total + (item.total_different_quantity || 0);
        }, 0);

        const total_different_money = data.reduce((total, item) => {
            return total + (item.total_different_money || 0);
        }, 0);
        return {
            total_different_quantity,
            total_different_money,
        };
    }

    async updateRealQuantity(id: number, body: IInventory): Promise<IIdResponse> {
        const inventoryData = await this.findById(id);
        if (!inventoryData) return { id };

        await this.db.$transaction(async (tx) => {
            const { files, details } = body;
            // 1. update data
            let dataUpdate: any = { status: CommonApproveStatus.CONFIRMED };
            if (files && files.length > 0) {
                let filesUpdate = handleFiles(files, [], inventoryData?.files || []);
                dataUpdate.files = filesUpdate;
            }

            await this.repo.update({ id }, dataUpdate, tx);
            // 2. update real_quantity, note trong details
            if (!details || details.length === 0) return;
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

            // import inventory
            if (InventoryTypeIn.includes(inventoryData.type as any)) {
                logger.info(`Approve inventory with real quantity for ID ${id}`);
                await this.handleApprove(id, inventoryData, tx);
            }
            // export inventory
            if (InventoryTypeOut.includes(inventoryData.type as any)) {
                logger.info(`Processing export inventory with FIFO logic for ID ${id}`);
                await this.processFIFOExportV2(details, tx);
                await this.handleApprove(id, inventoryData, tx);
            }
        });

        return { id };
    }

    private async checkProductAndOrderTolerances(
        orderId: number,
        inventoryDetails: any[],
        tolerance: number,
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        logger.info(`[Tolerance Check] Starting validation for order ${orderId} with tolerance ${tolerance}%`);

        let totalValueConverted = 0;

        for (const inventoryDetail of inventoryDetails) {
            // const orderDetail = orderDetails.find((od) => od.id === inventoryDetail.order_detail_id);
            if (!inventoryDetail.order_detail) {
                logger.warn(
                    `[Tolerance Check] Order detail not found for inventory detail: ${inventoryDetail.order_detail_id}`,
                );
                continue;
            }

            // Calculate new import quantity for this product
            const newImportQty = calculateConvertQty({
                ...inventoryDetail.order_detail,
                quantity: inventoryDetail.quantity || 0,
            });
            totalValueConverted += newImportQty;

            logger.info(
                `[Tolerance Check] Product ${inventoryDetail.order_detail.product_id}: New import qty = ${newImportQty}`,
            );

            // Get current imported for this specific product
            const confirmedImported = await this.transactionWarehouseRepo.aggregate(
                { order_id: orderId, type: 'in', product_id: inventoryDetail.order_detail.product_id },
                { _sum: { convert_quantity: true } },
                tx,
            );

            // Get pending inventory quantities (not yet confirmed/approved)
            const pendingInventories = await this.inventoryDetailRepo.findMany(
                {
                    order_detail_id: inventoryDetail.order_detail_id,
                    inventory: {
                        status: CommonApproveStatus.PENDING,
                    },
                },
                false,
                tx,
            );

            // Calculate pending quantity
            const pendingQty = pendingInventories.reduce((sum, item) => {
                const convertedQty = calculateConvertQty({
                    ...inventoryDetail.order_detail,
                    quantity: item.quantity || 0,
                });
                return sum + convertedQty;
            }, 0);

            // Check individual product tolerance
            const orderQuantity = calculateConvertQty(inventoryDetail.order_detail);
            const confirmedQty = confirmedImported?._sum?.convert_quantity || 0;
            const totalPendingAndNew = pendingQty + newImportQty;
            // const totalImported = confirmedQty + newImportQty;
            const totalAllQuantities = confirmedQty + totalPendingAndNew;
            const productProgress = orderQuantity > 0 ? (totalAllQuantities / orderQuantity) * 100 : 0;

            logger.info(`[Tolerance Check] Product ${inventoryDetail.order_detail.product_id}:`, {
                orderQuantity,
                confirmedQty,
                newImportQty,
                totalAllQuantities,
                productProgress: `${productProgress.toFixed(2)}%`,
                toleranceLimit: `${100 + tolerance}%`,
                isExceeded: productProgress > 100 + tolerance,
            });

            if (productProgress > 100 + tolerance) {
                logger.error(
                    `[Tolerance Check] Product ${inventoryDetail.order_detail.product_id} exceeds tolerance: ${productProgress.toFixed(2)}% > ${100 + tolerance}%`,
                );
                throw new APIError({
                    message: `Product exceeds tolerance: ${productProgress.toFixed(2)}% > ${100 + tolerance}%`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`quantity.exceeded.${inventoryDetail?.key}`],
                });
            }
        }

        logger.info(`[Tolerance Check] Total value converted: ${totalValueConverted}`);

        // Check overall order tolerance
        // Check overall order tolerance including pending inventories
        const totalPendingForOrder = await this.calculateTotalPendingQuantity(orderId, tx);
        const orderProgress = await this.calculateDeliveryProgressWithPending(
            orderId,
            tx,
            totalValueConverted,
            totalPendingForOrder,
        );

        logger.info(` Order validation:`, {
            totalConverted: totalValueConverted,
            totalPending: totalPendingForOrder,
            orderProgress: `${orderProgress.toFixed(2)}%`,
            toleranceLimit: `${100 + tolerance}%`,
            isExceeded: orderProgress > 100 + tolerance,
        });

        if (orderProgress > 100 + tolerance) {
            logger.error(
                `[Tolerance Check] Order ${orderId} exceeds tolerance: ${orderProgress.toFixed(2)}% > ${100 + tolerance}%`,
            );
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
        const pendingInventories = await this.inventoryDetailRepo.findMany(
            {
                inventory: {
                    order_id: orderId,
                    status: CommonApproveStatus.PENDING,
                },
            },
            true,
            tx,
        );

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
        pendingQty: number = 0,
    ): Promise<number> {
        const orderDetails = await this.orderDetailRepo.findMany({ order_id: orderId }, true, tx);

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
    public async approveExportInventory(id: number, body: IApproveRequest): Promise<IIdResponse> {
        const inventoryData = await this.validateStatusApprove(id);

        try {
            await this.db.$transaction(async (tx) => {
                // 1. Cập nhật status của inventory
                await this.repo.update({ id }, body, tx); // 2. Lấy chi tiết phiếu xuất
                const inventoryDetails = await tx.inventoryDetails.findMany({
                    where: { inventory_id: id },
                    select: InventoryDetailSelectionProduct,
                });

                // 3. Sử dụng batch processing để xử lý FIFO cho tất cả sản phẩm
                await this.batchProcessFIFOExport(id, inventoryDetails, inventoryData, tx);

                // 4. Cập nhật delivery progress cho order nếu có
                if (inventoryData.order_id) {
                    await this.updateOrderProgressAfterExport(inventoryData.order_id, tx);
                }
            });

            return { id };
        } catch (error) {
            throw error;
        }
    } /**
     * Xử lý FIFO export - nhập trước xuất trước
     */
    private async processFIFOExport(
        productId: number,
        exportQuantity: number,
        warehouseId: number,
        inventoryDetail: any,
        inventoryData: any,
        inventoryId: number,
        tx: Prisma.TransactionClient,
    ): Promise<void> {
        logger.info(`[FIFO Export] Processing export for product ${productId}, quantity: ${exportQuantity}`);

        // 1. Lấy tổng số lượng tồn kho hiện tại
        const currentStock = await this.getCurrentStock(productId, warehouseId, tx);

        if (currentStock < exportQuantity) {
            throw new APIError({
                message: `Không đủ hàng tồn kho. Tồn kho hiện tại: ${currentStock}, yêu cầu xuất: ${exportQuantity}`,
                status: ErrorCode.BAD_REQUEST,
                errors: ['inventory.insufficient_stock'],
            });
        }

        // 3. Tạo transaction xuất kho tổng hợp
        const productData = (inventoryDetail.order_detail as any)?.product;
        const exportTransaction = {
            real_quantity: exportQuantity,
            convert_quantity: exportQuantity,
            quantity: inventoryDetail.quantity || exportQuantity,
            inventory: { connect: { id: inventoryId } },
            inventory_detail: { connect: { id: inventoryDetail.id } },
            warehouse: { connect: { id: warehouseId } },
            order: { connect: { id: inventoryData.order_id } },
            product: { connect: { id: productId } },
            ...(productData?.parent_id && { child: { connect: { id: productData.id } } }),
            type: 'out',
            time_at: inventoryData.time_at,
            note: `FIFO export`,
        };

        await this.transactionWarehouseRepo.create(exportTransaction, tx);

        // 4. Cập nhật import quantity trong order details
        await this.commonDetailService.updateImportQuantity(
            { id: inventoryDetail.order_detail_id },
            { type: 'decrease', quantity: inventoryDetail.quantity || exportQuantity },
            tx,
        );

        logger.info(`[FIFO Export] Successfully exported ${exportQuantity} for product ${productId}`);
    }

    /**
     * Lấy số lượng tồn kho hiện tại
     */
    private async getCurrentStock(
        productId: number,
        warehouseId: number,
        tx: Prisma.TransactionClient,
    ): Promise<number> {
        const stockData = await tx.transactionWarehouses.aggregate({
            where: {
                product_id: productId,
                warehouse_id: warehouseId,
                inventory: {
                    status: CommonApproveStatus.CONFIRMED,
                },
            },
            _sum: {
                convert_quantity: true,
            },
        });

        return stockData._sum.convert_quantity || 0;
    }

    /**
     * Cập nhật delivery progress sau khi xuất kho
     */
    private async updateOrderProgressAfterExport(orderId: number, tx: Prisma.TransactionClient): Promise<void> {
        const orderDetails = await tx.commonDetails.findMany({
            where: { order_id: orderId },
            select: CommonDetailSelectionAll,
        });

        let initQty = 0;
        if (orderDetails && orderDetails.length > 0) {
            initQty = orderDetails.reduce((total, detail) => {
                const convertedQuantity = calculateConvertQty(detail);
                return total + convertedQuantity;
            }, 0);
        }

        const importQty = await this.transactionWarehouseRepo.aggregate(
            { order_id: orderId, type: 'in' },
            { _sum: { convert_quantity: true } },
            tx,
        );

        const exportQty = await this.transactionWarehouseRepo.aggregate(
            { order_id: orderId, type: 'out' },
            { _sum: { convert_quantity: true } },
            tx,
        );

        const netImportQty = (importQty?._sum?.convert_quantity || 0) - (exportQty?._sum?.convert_quantity || 0);
        const percent = initQty > 0 ? (netImportQty / initQty) * 100 : 0;

        const orderData = await this.orderRepo.findOne({ id: orderId }, false, tx);
        const isDone = percent >= 100 - (orderData?.tolerance || 0);

        await this.orderRepo.update({ id: orderId }, { delivery_progress: Math.max(0, percent), isDone }, tx);
    }

    /**
     * Kiểm tra tồn kho có đủ để xuất không
     */
    public async checkStockAvailability(
        checks: Array<{
            productId: number;
            warehouseId: number;
            requiredQuantity: number;
        }>,
        tx?: Prisma.TransactionClient,
    ): Promise<{
        isAvailable: boolean;
        details: Array<{
            productId: number;
            warehouseId: number;
            currentStock: number;
            requiredQuantity: number;
            shortage: number;
        }>;
    }> {
        const database = tx || this.db;
        const details = [];
        let isAvailable = true;

        for (const check of checks) {
            const currentStock = await this.getCurrentStock(
                check.productId,
                check.warehouseId,
                database as Prisma.TransactionClient,
            );

            const shortage = Math.max(0, check.requiredQuantity - currentStock);
            if (shortage > 0) {
                isAvailable = false;
            }

            details.push({
                productId: check.productId,
                warehouseId: check.warehouseId,
                currentStock,
                requiredQuantity: check.requiredQuantity,
                shortage,
            });
        }

        return {
            isAvailable,
            details,
        };
    }

    /**
     * Tối ưu hóa: Batch processing cho nhiều sản phẩm xuất cùng lúc
     */
    public async batchProcessFIFOExport(
        inventoryId: number,
        inventoryDetails: any[],
        inventoryData: any,
        tx: Prisma.TransactionClient,
    ): Promise<void> {
        // 1. Kiểm tra tồn kho trước khi thực hiện xuất
        const stockChecks = inventoryDetails
            .map((detail) => ({
                productId:
                    (detail.order_detail as any)?.product?.parent_id || (detail.order_detail as any)?.product?.id,
                warehouseId: inventoryData.warehouse_id!,
                requiredQuantity: detail.real_quantity || detail.quantity || 0,
            }))
            .filter((check) => check.productId && check.requiredQuantity > 0);

        const stockAvailability = await this.checkStockAvailability(stockChecks, tx);

        if (!stockAvailability.isAvailable) {
            const shortageDetails = stockAvailability.details
                .filter((d) => d.shortage > 0)
                .map((d) => `Product ${d.productId}: thiếu ${d.shortage}`)
                .join(', ');

            throw new APIError({
                message: `Không đủ hàng tồn kho: ${shortageDetails}`,
                status: ErrorCode.BAD_REQUEST,
                errors: ['inventory.insufficient_stock'],
            });
        }

        // 2. Thực hiện xuất kho cho từng sản phẩm
        for (const detail of inventoryDetails) {
            if (!detail.order_detail_id || !detail.order_detail) continue;

            const exportQuantity = detail.real_quantity || detail.quantity || 0;
            const productId =
                (detail.order_detail as any)?.product?.parent_id || (detail.order_detail as any)?.product?.id;

            if (exportQuantity > 0 && productId) {
                await this.processFIFOExport(
                    productId,
                    exportQuantity,
                    inventoryData.warehouse_id!,
                    detail,
                    inventoryData,
                    inventoryId,
                    tx,
                );
            }
        }
    }

    /**
     * Validate stock availability for export inventory
     * Kiểm tra tồn kho cho phiếu xuất kho
     */
    private async validateStockForExport(
        details: any[],
        warehouseId: number,
        tx: Prisma.TransactionClient,
    ): Promise<void> {
        logger.info(`[Stock Validation] Checking stock for export at warehouse ${warehouseId}`);

        const stockCheckErrors: string[] = [];

        for (const detail of details) {
            if (!detail.order_detail_id) continue;

            // Lấy thông tin order detail để biết product_id
            const orderDetail = await this.orderDetailRepo.findOne({ id: detail.order_detail_id }, true, tx);
            if (!orderDetail) {
                logger.warn(`[Stock Validation] Order detail not found: ${detail.order_detail_id}`);
                continue;
            }

            const productData = (orderDetail as any)?.product;
            if (!productData) {
                logger.warn(`[Stock Validation] Product not found for order detail: ${detail.order_detail_id}`);
                continue;
            }

            // Lấy product_id (ưu tiên parent_id nếu có)
            const productId = productData.parent_id || productData.id;

            // Số lượng xuất yêu cầu
            const exportQuantity = detail.real_quantity || detail.quantity || 0;

            if (exportQuantity <= 0) continue;

            // Lấy tồn kho hiện tại
            const currentStock = await this.getCurrentStock(productId, warehouseId, tx);

            logger.info(`[Stock Validation] Product ${productId} (${productData.name}):`, {
                currentStock,
                exportQuantity,
                isAvailable: currentStock >= exportQuantity,
            });

            // Kiểm tra đủ tồn kho không
            if (currentStock < exportQuantity) {
                const shortage = exportQuantity - currentStock;
                const productName = productData.name || `Product ${productId}`;
                const unitName = productData.unit?.name || 'đơn vị';

                stockCheckErrors.push(
                    `${productName}: Thiếu ${shortage} ${unitName} (Tồn kho: ${currentStock}, Yêu cầu: ${exportQuantity})`,
                );

                logger.error(`[Stock Validation] Insufficient stock for product ${productId}:`, {
                    productName,
                    currentStock,
                    exportQuantity,
                    shortage,
                });
            }
        }

        // Nếu có lỗi tồn kho thì throw error
        if (stockCheckErrors.length > 0) {
            const errorMessage = `Không đủ hàng tồn kho để xuất:\n${stockCheckErrors.join('\n')}`;

            logger.error(`[Stock Validation] Export validation failed:`, {
                warehouseId,
                errors: stockCheckErrors,
            });

            throw new APIError({
                message: errorMessage,
                status: StatusCode.BAD_REQUEST,
                errors: [`inventory.${ErrorKey.INVALID}`],
            });
        }

        logger.info(`[Stock Validation] ✅ All products have sufficient stock for export`);
    }

    async updateAdjustQuantity(id: number, body: IInventory): Promise<IIdResponse> {
        const inventoryData = await this.findById(id);
        if (!inventoryData) return { id };

        await this.db.$transaction(async (tx) => {
            const { details } = body;
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
            }
        });

        return { id };
    }
}
