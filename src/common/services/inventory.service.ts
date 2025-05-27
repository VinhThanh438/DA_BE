import { BaseService } from './base.service';
import { Inventories, Prisma } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import eventbus from '@common/eventbus';
import { calculateConvertQty } from '@common/helpers/calculate-convert-qty';
import { IApproveRequest, IIdResponse, IUpdateChildAction } from '@common/interfaces/common.interface';
import { IInventory, InventoryDetail } from '@common/interfaces/inventory.interface';
import { ITransactionWarehouse } from '@common/interfaces/transaction-warehouse.interface';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { InventoryDetailRepo } from '@common/repositories/inventory-detail.repo';
import { InventoryRepo } from '@common/repositories/inventory.repo';
import { OrderRepo } from '@common/repositories/order.repo';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import { TransactionWarehouseRepo } from '@common/repositories/transaction-warehouse.repo';
import { UnitRepo } from '@common/repositories/unit.repo';
import { WarehouseRepo } from '@common/repositories/warehouse.repo';
import { DEFAULT_EXCLUDED_FIELDS, InventoryType, InventoryTypeDirectionMap } from '@config/app.constant';
import { EVENT_INVENTORY_CREATED, EVENT_ORDER_IMPORT_QUANTITY } from '@config/event.constant';
import { CommonDetailService } from './common-detail.service';
import { handleFiles } from '@common/helpers/handle-files';
import { deleteFileSystem } from '@common/helpers/delete-file-system';
import { InventoryDetailSelection } from '@common/repositories/prisma/inventory-detail.select';

export class InventoryService extends BaseService<Inventories, Prisma.InventoriesSelect, Prisma.InventoriesWhereInput> {
    private static instance: InventoryService;
    private inventoryDetailRepo: InventoryDetailRepo = new InventoryDetailRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private organizationRepo: OrganizationRepo = new OrganizationRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private warehouseRepo: WarehouseRepo = new WarehouseRepo();
    private orderDetailRepo: CommonDetailRepo = new CommonDetailRepo();
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
                delivery_id: this.partnerRepo,
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
                    const { key, ...rest } = item;

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

    public async updateInventory(id: number, request: Partial<IInventory>): Promise<IIdResponse> {
        const { delete: deleteIds, update, add, details, files_add, files_delete, ...body } = request;
        const inventoryData = await this.canEdit(id, 'inventory');

        try {
            const inventoryExist = await this.findById(id);

            await this.isExist({ code: request.code, id }, true);

            await this.validateForeignKeys(request, {
                customer_id: this.partnerRepo,
                supplier_id: this.partnerRepo,
                delivery_id: this.partnerRepo,
                employee_id: this.employeeRepo,
                organization_id: this.organizationRepo,
                order_id: this.orderRepo,
            });

            // handle files
            let filesUpdate = handleFiles(files_add, files_delete, inventoryExist?.files);
            await this.db.$transaction(async (tx) => {
                const updatedInventory = await tx.inventories.update({
                    where: { id },
                    data: { ...body, ...(filesUpdate !== null && { files: filesUpdate }) },
                });

                // [add] order details
                if (add && add.length > 0) {
                    await this.validateForeignKeys(add, { order_detail_id: this.orderDetailRepo }, tx);

                    const data = add.map((item) => {
                        const { key, ...rest } = item;
                        return { ...rest, inventory_id: id };
                    });
                    await this.inventoryDetailRepo.createMany(data, tx);

                    // const warehouseTransactions: any[] = [];
                    // for (const item of add) {
                    //     const { key, ...detailData } = item;
                    //     const createdDetail = await tx.inventoryDetails.create({
                    //         data: { ...detailData, inventory_id: id },
                    //     });

                    //     // if (createdDetail.order_detail_id) {
                    //     //     await this.commonDetailService.updateImportQuantity(
                    //     //         { id: createdDetail.order_detail_id },
                    //     //         { type: 'increase', quantity: createdDetail.real_quantity || 0 },
                    //     //         tx,
                    //     //     );
                    //     // }

                    //     // warehouseTransactions.push({
                    //     //     // inventory_detail_id: createdDetail.id,
                    //     //     // order_id: updatedInventory.order_id,
                    //     //     // order_detail_id: createdDetail.order_detail_id,
                    //     //     // inventory_id: id,
                    //     //     // warehouse_id: updatedInventory.warehouse_id,
                    //     //     real_quantity: createdDetail.real_quantity,
                    //     //     quantity: createdDetail.quantity,
                    //     //     inventory: { connect: { id: id } },
                    //     //     inventory_detail: { connect: { id: createdDetail.id } },
                    //     //     warehouse: { connect: { id: updatedInventory.warehouse_id! } },
                    //     //     order: { connect: { id: updatedInventory.order_id } },
                    //     //     type: InventoryTypeDirectionMap[updatedInventory.type],
                    //     //     time_at: updatedInventory.time_at,
                    //     // });
                    // }
                    // console.log('create transaction warehouse');
                    // console.log(warehouseTransactions);
                    // await this.transactionWarehouseRepo.createMany(warehouseTransactions, tx);
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
                        const { key, ...rest } = item;
                        return rest;
                    });
                    await this.inventoryDetailRepo.updateMany(data, tx);

                    // const warehouseUpdates = [];
                    // for (const item of update) {
                    //     const { key, id: detailId, ...detailData } = item;

                    //     const originalDetail = await this.inventoryDetailRepo.findOne({ id: detailId }, false, tx);
                    //     if (!originalDetail)
                    //         throw new APIError({
                    //             message: `common.status.not_found`,
                    //             status: ErrorCode.NOT_FOUND,
                    //             errors: [`id.${ErrorKey.NOT_FOUND}.${key}`],
                    //         });

                    //     const updatedDetail = await tx.inventoryDetails.update({
                    //         where: { id: detailId },
                    //         data: detailData,
                    //     });

                    //     // console.log('order detail id: ', originalDetail.order_detail_id);
                    //     // console.log('old qty: ', originalDetail.real_quantity);
                    //     // console.log('new qty: ', detailData.real_quantity);
                    //     // update if quantity changed
                    //     // if (
                    //     //     originalDetail.order_detail_id &&
                    //     //     detailData.real_quantity !== originalDetail.real_quantity
                    //     // ) {
                    //     //     await this.commonDetailService.updateImportQuantity(
                    //     //         { id: originalDetail.order_detail_id },
                    //     //         {
                    //     //             type: 'update',
                    //     //             quantity: detailData.real_quantity,
                    //     //         },
                    //     //         tx,
                    //     //     );
                    //     // }

                    //     // Add to warehouse updates
                    //     // warehouseUpdates.push({
                    //     //     inventory_id: id,
                    //     //     order_id: updatedInventory.order_id,
                    //     //     note: updatedDetail.note,
                    //     //     id: updatedDetail.id,
                    //     //     real_quantity: updatedDetail.real_quantity,
                    //     //     quantity: updatedDetail.quantity,
                    //     //     order_detail_id: updatedDetail.order_detail_id,
                    //     //     type: InventoryTypeDirectionMap[updatedInventory.type],
                    //     //     time_at: updatedInventory.time_at,
                    //     //     warehouse_id: updatedInventory.warehouse_id,
                    //     // });
                    // }

                    // console.log('update transaction warehouse');
                    // for (const item of warehouseUpdates) {
                    //     const { id, inventory_id, order_id, order_detail_id, warehouse_id, ...rest } = item;
                    //     const transactionWarehouse = await this.transactionWarehouseRepo.findOne({
                    //         inventory_detail_id: id,
                    //     });
                    //     if (transactionWarehouse) {
                    //         await this.transactionWarehouseRepo.update(
                    //             { id: transactionWarehouse.id },
                    //             {
                    //                 ...rest,
                    //                 inventory: { connect: { id: inventory_id } },
                    //                 order: { connect: { id: order_id } },
                    //                 // order_detail: { connect: { id: order_detail_id } },
                    //                 warehouse: { connect: { id: warehouse_id } },
                    //             },
                    //             tx,
                    //         );
                    //     }
                    // }
                }

                // [delete] order details
                if (deleteIds && deleteIds.length > 0) {
                    // const detailsToDelete = await this.inventoryDetailRepo.findMany(
                    //     { id: { in: deleteIds } },
                    //     false,
                    //     tx,
                    // );

                    // for (const detail of detailsToDelete) {
                    //     if (detail.order_detail_id) {
                    //         await this.commonDetailService.updateImportQuantity(
                    //             { id: detail.order_detail_id },
                    //             {
                    //                 type: 'decrease',
                    //                 quantity: detail.real_quantity || 0,
                    //             },
                    //             tx,
                    //         );
                    //     }
                    // }

                    await this.inventoryDetailRepo.deleteMany({ id: { in: deleteIds } }, tx, false);
                }
            });

            // update is done in order
            // if (inventoryExist?.order_id) {
            //     const orderDetails = await this.orderDetailRepo.findMany({ order_id: inventoryExist?.order_id }, true);

            //     let initQty: number = 0;
            //     if (!orderDetails || orderDetails.length === 0) initQty = 0;
            //     initQty = orderDetails.reduce((total, detail) => {
            //         const convertedQuantity = calculateConvertQty(detail);
            //         return total + convertedQuantity;
            //     }, 0);
            //     const importQty = await this.transactionWarehouseRepo.aggregate(
            //         { order_id: inventoryExist?.order_id, type: 'in' },
            //         {
            //             _sum: {
            //                 real_quantity: true,
            //             },
            //         },
            //     );
            //     const percent = initQty > 0 ? ((importQty?._sum?.real_quantity || 0) / initQty) * 100 : 0;
            //     await this.orderRepo.update({ id: inventoryExist?.order_id }, { delivery_progress: percent });
            // }

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
                let totalRealQty = 0;
                let dataImport: { [key: number]: number } = {};
                const warehouseTransactionData: any[] = [];
                const inventoryDetails = await this.inventoryDetailRepo.findMany({ inventory_id: id }, false, tx);
                for (const item of inventoryDetails) {
                    if (!item.order_detail_id) continue;
                    if (!dataImport[item.order_detail_id]) {
                        dataImport[item.order_detail_id] = item.real_quantity || 0;
                    } else {
                        dataImport[item.order_detail_id] += item.real_quantity || 0;
                    }

                    totalRealQty += item.real_quantity || 0;
                    warehouseTransactionData.push({
                        // inventory_detail_id: createdDetail.id,
                        // order_id: updatedInventory.order_id,
                        // order_detail_id: createdDetail.order_detail_id,
                        // inventory_id: id,
                        // warehouse_id: updatedInventory.warehouse_id,
                        real_quantity: item.real_quantity || 0,
                        quantity: item.quantity || 0,
                        inventory: { connect: { id: id } },
                        inventory_detail: { connect: { id: item.id } },
                        warehouse: { connect: { id: inventoryData.warehouse_id! } },
                        order: { connect: { id: inventoryData.order_id } },
                        type: InventoryTypeDirectionMap[inventoryData.type as InventoryType],
                        time_at: inventoryData.time_at,
                    });
                }

                // update import quantity in order details
                for (const [key, value] of Object.entries(dataImport)) {
                    const qtyInfo = await this.commonDetailService.updateImportQuantity(
                        { id: Number(key) },
                        { type: 'increase', quantity: value },
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
                                real_quantity: true,
                            },
                        },
                    );
                    const percent = initQty > 0 ? ((importQty?._sum?.real_quantity || 0) / initQty) * 100 : 0;
                    await this.orderRepo.update({ id: inventoryData.order_id }, { delivery_progress: percent }, tx);
                }
            });

            return { id };
        } catch (error) {
            throw error;
        }
    }
}
