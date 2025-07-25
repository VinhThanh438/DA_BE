import { BaseService } from './master/base.service';
import { Orders, Prisma } from '.prisma/client';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { IApproveRequest, ICommonDetails, IIdResponse, IPaginationResponse } from '@common/interfaces/common.interface';
import { OrderRepo } from '@common/repositories/order.repo';
import { IOrder, IOrderDetailPurchaseProcessing, IOrderPaginationInput } from '@common/interfaces/order.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import { DEFAULT_EXCLUDED_FIELDS, OrderType } from '@config/app.constant';
import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey, StatusCode } from '@common/errors';
import { RepresentativeRepo } from '@common/repositories/representative.repo';
import { BankRepo } from '@common/repositories/bank.repo';
import { UnitRepo } from '@common/repositories/unit.repo';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { handleFiles } from '@common/helpers/handle-files';
import { ShippingPlanRepo } from '@common/repositories/shipping-plan.repo';
import moment from 'moment-timezone';
import { calculateConvertQty } from '@common/helpers/calculate-convert-qty';
import { UnloadingCostRepo } from '@common/repositories/unloading-cost.repo';
import { CommonService } from './common.service';
import { EVENT_DELETE_UNUSED_FILES } from '@config/event.constant';
import eventbus from '@common/eventbus';
import { TransactionWarehouseService } from './transaction-warehouse.service';

export class OrderService extends BaseService<Orders, Prisma.OrdersSelect, Prisma.OrdersWhereInput> {
    private static instance: OrderService;
    private orderDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private productRepo: ProductRepo = new ProductRepo();
    private bankRepo: BankRepo = new BankRepo();
    private unitRepo: UnitRepo = new UnitRepo();
    private representativeRepo: RepresentativeRepo = new RepresentativeRepo();
    private transactionRepo: TransactionRepo = new TransactionRepo();
    private shippingPlanRepo: ShippingPlanRepo = new ShippingPlanRepo();
    private unloadingCostRepo = new UnloadingCostRepo();
    private transWhService = TransactionWarehouseService.getInstance();

    private constructor() {
        super(new OrderRepo());
    }

    public static getInstance(): OrderService {
        if (!this.instance) {
            this.instance = new OrderService();
        }
        return this.instance;
    }

    public async enrichOrderTotals(responseData: IPaginationResponse): Promise<IPaginationResponse> {
        const enrichedData = await Promise.all(
            responseData.data.map(async (order: any) => {
                let total_money = 0;
                let total_vat = 0;
                let total_commission = 0;

                for (const detail of order.details) {
                    const orderDetail = await this.orderDetailRepo.findOne({ id: detail.order_detail_id });
                    if (!orderDetail) continue;

                    const quantity = Number(orderDetail.imported_quantity || 0);
                    const price = Number(orderDetail.price || 0);
                    const vat = Number(orderDetail.vat || 0);
                    const commission = Number(orderDetail.commission || 0);

                    const totalMoney = quantity * price;
                    const totalVat = (totalMoney * vat) / 100;
                    const totalCommission = (totalMoney * commission) / 100;

                    total_money += totalMoney;
                    total_vat += totalVat;
                    total_commission += totalCommission;
                }

                const total_amount = total_money + total_vat;

                return {
                    ...order,
                    total_money,
                    total_vat,
                    total_amount,
                    total_commission,
                };
            }),
        );

        return {
            ...responseData,
            data: enrichedData,
        };
    }

    public async attachPaymentInfoToOrder(order: IOrder): Promise<IOrder> {
        const transactionData = await this.transactionRepo.findMany({
            order_id: order.id,
        });

        const totalPaid = transactionData
            .filter((t) => t.type === 'out')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const totalCommissionPaid = transactionData
            .filter((t) => t.note?.toLowerCase().includes('hoa hồng'))
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const totalOrderAmount = (order.details ?? []).reduce((sum, detail) => {
            const detailTotal = detail.quantity * detail.price;
            const detailVat = (detailTotal * (detail.vat || 0)) / 100;
            return sum + detailTotal + detailVat;
        }, 0);

        const detailsWithPayments = await Promise.all(
            (order.details ?? []).map(async (detail: ICommonDetails) => {
                const quantity = detail.quantity;
                const price = detail.price;
                const vatPercent = detail.vat || 0;
                const commission = detail.commission || 0;

                const detailTotal = quantity * price;
                const detailVat = (detailTotal * vatPercent) / 100;
                const detailTotalAfterVat = detailTotal + detailVat;

                const ratio = totalOrderAmount ? detailTotalAfterVat / totalOrderAmount : 0;

                const amount_paid = ratio * totalPaid;
                const amount_debt = detailTotalAfterVat - amount_paid;
                const commission_paid = ratio * totalCommissionPaid;
                const commission_debt = commission - commission_paid;

                // Await the async method call
                const progress =
                    order.type === OrderType.PURCHASE
                        ? await this.getOrderDetailPurchaseProcessing({
                            ...detail,
                            order_id: order.id,
                        } as IOrderDetailPurchaseProcessing)
                        : await this.getOrderDetailExportProcessing({ ...detail, order_id: order.id });
                return {
                    ...detail,
                    amount_paid,
                    amount_debt,
                    commission_paid,
                    commission_debt,
                    progress,
                    product: CommonService.transformProductDataStock(detail.product as any),
                };
            }),
        );

        return {
            ...order,
            details: detailsWithPayments as any,
        };
    }

    public checkIsDone(progress: number, tolerance: number) {
        if (progress >= 100 - tolerance) {
            return true;
        }
        return false;
    }

    public async paginate(query: IOrderPaginationInput): Promise<IPaginationResponse> {
        // delete query.isDone;

        if (query.types && Array.isArray(query.types) && query.types.length > 0) {
            query.type = { in: query.types };
            delete query.types;
        }

        const data = await this.repo.paginate(query, true);
        data.data = await Promise.all(data.data.map((order: IOrder) => this.attachPaymentInfoToOrder(order)));

        // Calculate totals for each order and overall summary
        let summary_total_money = 0;
        let summary_total_vat = 0;
        let summary_total_commission = 0;

        const enrichedData = await Promise.all(
            data.data.map(async (order: any) => {
                let total_money = 0;
                let total_vat = 0;
                let total_commission = 0;

                for (const detail of order.details || []) {
                    const quantity = Number(detail.quantity || 0);
                    const price = Number(detail.price || 0);
                    const vat = Number(detail.vat || 0);
                    const commission = Number(detail.commission || 0);

                    const detailTotal = quantity * price;
                    const detailVat = (detailTotal * vat) / 100;
                    const detailCommission = (detailTotal * commission) / 100;

                    total_money += detailTotal;
                    total_vat += detailVat;
                    total_commission += detailCommission;
                }

                const total_amount = total_money + total_vat;

                // Add to summary totals
                summary_total_money += total_money;
                summary_total_vat += total_vat;
                summary_total_commission += total_commission;

                return {
                    ...order,
                    // details: order.details.map((detail: any) => ({
                    //     ...detail,
                    //     product: CommonService.transformProductDataStock(detail.product || {}),
                    // })),
                    total_money: parseFloat(total_money.toFixed(2)),
                    total_vat: parseFloat(total_vat.toFixed(2)),
                    total_amount: parseFloat(total_amount.toFixed(2)),
                    total_commission: parseFloat(total_commission.toFixed(2)),
                };
            }),
        );

        const summary_total_amount = summary_total_money + summary_total_vat;

        return {
            ...data,
            data: enrichedData,
            summary: {
                total_money: parseFloat(summary_total_money.toFixed(2)),
                total_vat: parseFloat(summary_total_vat.toFixed(2)),
                total_amount: parseFloat(summary_total_amount.toFixed(2)),
                total_commission: parseFloat(summary_total_commission.toFixed(2)),
            },
        };
    }

    public async findById(id: number): Promise<Partial<IOrder> | null> {
        const data = (await this.repo.findOne({ id }, true)) as IOrder;

        if (!data) {
            throw new APIError({
                message: 'common.not-found',
                status: ErrorCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }

        return this.attachPaymentInfoToOrder(data);
    }

    public async create(request: IOrder): Promise<IIdResponse> {
        let orderId = 0;

        await this.isExist({ code: request.code });

        await this.validateForeignKeys(request, {
            partner_id: this.partnerRepo,
            employee_id: this.employeeRepo,
            representative_id: this.representativeRepo,
            bank_id: this.bankRepo,
        });

        const { shipping_plans, details, unloading_costs, ...orderData } = request;

        await this.db.$transaction(async (tx) => {
            const { partner_id, employee_id, bank_id, representative_id, ...restData } = orderData;
            Object.assign(restData, {
                partner: partner_id ? { connect: { id: partner_id } } : undefined,
                employee: employee_id ? { connect: { id: employee_id } } : undefined,
                representative: representative_id ? { connect: { id: representative_id } } : undefined,
                bank: bank_id ? { connect: { id: bank_id } } : undefined,
            });
            orderId = await this.repo.create(restData as Partial<Orders>, tx);

            if (details && details.length > 0) {
                await this.validateForeignKeys(
                    details,
                    {
                        product_id: this.productRepo,
                        unit_id: this.unitRepo,
                    },
                    tx,
                );

                const mappedData = this.autoMapConnection(details, {
                    order_id: orderId,
                });

                const filteredData = this.filterData(mappedData, DEFAULT_EXCLUDED_FIELDS, ['details']);

                await this.orderDetailRepo.createMany(filteredData, tx);
            } else {
                throw new APIError({
                    message: `common.status.${StatusCode.BAD_REQUEST}`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`details.${ErrorKey.INVALID}`],
                });
            }

            if (shipping_plans && shipping_plans.length > 0) {
                await this.validateForeignKeys(
                    shipping_plans,
                    {
                        partner_id: this.partnerRepo,
                    },
                    tx,
                );
                const data = shipping_plans.map((item) => {
                    const { key, ...rest } = item;
                    return { ...rest, order_id: orderId, organization_id: request.organization_id };
                });
                await this.shippingPlanRepo.createMany(data, tx);
            }

            if (unloading_costs && unloading_costs.length > 0) {
                await this.validateForeignKeys(
                    unloading_costs,
                    {
                        unit_id: this.unitRepo,
                    },
                    tx,
                );
                const data = unloading_costs.map((item) => {
                    const { key, ...rest } = item;
                    return { ...rest, order_id: orderId, organization_id: request.organization_id };
                });
                await this.unloadingCostRepo.createMany(data);
            }
        });
        return { id: orderId };
    }

    public async updateOrder(id: number, request: IOrder): Promise<IIdResponse> {
        const {
            details,
            add,
            update,
            delete: deleteIds,
            contracts,
            invoices,
            productions,
            inventories,
            files_add,
            files_delete,
            files,
            shipping_plans_add,
            shipping_plans_delete,
            shipping_plans_update,
            unloading_costs_add,
            unloading_costs_update,
            unloading_costs_delete,
            ...orderData
        } = request;

        try {
            const orderExists = await this.findById(id);
            if (!orderExists) {
                return { id };
            }

            // start update
            await this.validateForeignKeys(request, {
                partner_id: this.partnerRepo,
                employee_id: this.employeeRepo,
                representative_id: this.representativeRepo,
                bank_id: this.bankRepo,
            });

            // handle files
            let filesUpdate = handleFiles(files_add, files_delete, orderExists.files);

            await this.db.$transaction(async (tx) => {
                await this.repo.update(
                    { id },
                    {
                        ...orderData,
                        ...(filesUpdate !== null && { files: filesUpdate }),
                    } as Partial<Orders>,
                    tx,
                );

                // [add] order details
                if (add && add.length > 0) {
                    await this.validateForeignKeys(
                        add,
                        {
                            product_id: this.productRepo,
                            unit_id: this.unitRepo,
                        },
                        tx,
                    );

                    const data = add.map((item) => {
                        const { key, ...rest } = item;
                        return { ...rest, order_id: id };
                    });
                    await this.orderDetailRepo.createMany(data, tx);
                }

                // [update] order details
                if (update && update.length > 0) {
                    await this.validateForeignKeys(
                        update,
                        {
                            id: this.orderDetailRepo,
                            product_id: this.productRepo,
                            unit_id: this.unitRepo,
                        },
                        tx,
                    );

                    const data = update.map((item) => {
                        const { key, ...rest } = item;
                        return rest;
                    });
                    await this.orderDetailRepo.updateMany(data, tx);
                }

                // [delete] order details
                if (deleteIds && deleteIds.length > 0) {
                    await this.orderDetailRepo.deleteMany({ id: { in: deleteIds } }, tx, false);
                }

                // [add] shippings
                if (shipping_plans_add && shipping_plans_add.length > 0) {
                    await this.validateForeignKeys(shipping_plans_add, { partner_id: this.partnerRepo }, tx);

                    const data = shipping_plans_add.map((item) => {
                        const { key, ...rest } = item;
                        return { ...rest, order_id: id };
                    });
                    await this.shippingPlanRepo.createMany(data, tx);
                }

                // [update] shippings
                if (shipping_plans_update && shipping_plans_update.length > 0) {
                    await this.validateForeignKeys(
                        shipping_plans_update,
                        {
                            partner_id: this.partnerRepo,
                        },
                        tx,
                    );

                    const data = shipping_plans_update.map((item) => {
                        const { key, ...rest } = item;
                        return rest;
                    });
                    await this.shippingPlanRepo.updateMany(data, tx);
                }

                // [delete] shippings
                if (shipping_plans_delete && shipping_plans_delete.length > 0) {
                    await this.shippingPlanRepo.deleteMany({ id: { in: shipping_plans_delete } }, tx, false);
                }

                if (unloading_costs_add && unloading_costs_add.length > 0) {
                    await this.validateForeignKeys(unloading_costs_add, { unit_id: this.unitRepo }, tx);
                    const data = unloading_costs_add.map((item) => {
                        const { key, ...rest } = item;
                        return { ...rest, order_id: id };
                    });
                    await this.unloadingCostRepo.createMany(data, tx);
                }

                if (unloading_costs_update && unloading_costs_update.length > 0) {
                    await this.validateForeignKeys(
                        unloading_costs_update,
                        {
                            unit_id: this.unitRepo,
                        },
                        tx,
                    );
                    const data = unloading_costs_update.map((item) => {
                        const { key, ...rest } = item;
                        return rest;
                    });
                    await this.unloadingCostRepo.updateMany(data, tx);
                }

                if (unloading_costs_delete && unloading_costs_delete.length > 0) {
                    await this.unloadingCostRepo.deleteMany({ id: { in: unloading_costs_delete } }, tx, false);
                }
            });

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

    public async approveShippingPlan(id: number, body: IApproveRequest): Promise<IIdResponse> {
        const shippingPlanData = await this.validateStatusApprove(id, this.shippingPlanRepo);
        if (body.files && body.files.length > 0) {
            const orderData = await this.repo.findOne({ id: (shippingPlanData as any)?.order_id });
            if (!orderData) {
                throw new APIError({
                    message: 'common.not-found',
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`order_id.${ErrorKey.NOT_FOUND}`],
                });
            }

            let filesUpdate = handleFiles(body.files, [], orderData.files || []);
            await this.repo.update({ id: orderData.id }, { files: filesUpdate });
        }

        await this.shippingPlanRepo.update({ id }, body);

        return { id };
    }

    public async calculateTotalConvertedQuantity(orderId: number) {
        const orderDetails = await this.orderDetailRepo.findMany({ order_id: orderId }, true);

        if (!orderDetails || orderDetails.length === 0) return 0;

        return orderDetails.reduce((total, detail) => {
            const convertedQuantity = calculateConvertQty(detail);
            return total + convertedQuantity;
        }, 0);
    }

    public async getPurchaseProcessing(orderId: number) {
        const orderProducts = await this.db.commonDetails.findMany({
            where: { order_id: orderId },
            select: { id: true, product_id: true, product: true },
            distinct: ['product_id'],
        });

        const orderProductMap = new Map();
        orderProducts.forEach((item: any) => {
            if (item.product_id) {
                orderProductMap.set(item.product_id, item);
            }
        });

        const inventoryTransactions = await this.db.inventories.findMany({
            where: { order_id: orderId },
            select: {
                id: true,
                code: true,
                time_at: true,
                order_id: true,
                details: {
                    select: {
                        quantity: true,
                        // product_id: true,
                        order_detail: {
                            select: {
                                product_id: true,
                            },
                        },
                    },
                },
            },
            orderBy: { time_at: 'asc' },
        });

        const allTransactionProductIds = new Set<number>();
        inventoryTransactions.forEach((transaction) => {
            transaction.details.forEach((detail) => {
                if (detail.order_detail?.product_id) {
                    allTransactionProductIds.add(detail.order_detail.product_id);
                }
            });
        });

        const validProductIds = Array.from(allTransactionProductIds).filter((productId) =>
            orderProductMap.has(productId),
        );

        const importBatches = inventoryTransactions.map((transaction) => ({
            time_at: moment(transaction.time_at).format('YYYY-MM-DD'),
            code: transaction.code,
            transaction: transaction,
        }));

        const result = validProductIds.map((productId) => {
            const orderProduct = orderProductMap.get(productId);
            const productImports: any[] = [];
            let totalQuantity = 0;

            importBatches.forEach((batch) => {
                const transaction = batch.transaction;
                const productDetail = transaction.details.find((detail: any) => detail.product_id === productId);

                if (productDetail && (productDetail.quantity || 0) > 0) {
                    productImports.push({
                        time_at: batch.time_at,
                        code: batch.code,
                        quantity: productDetail.quantity || 0,
                    });
                    totalQuantity += productDetail.quantity || 0;
                } else {
                    productImports.push({
                        time_at: batch.time_at,
                        code: null,
                        quantity: 0,
                    });
                }
            });

            return {
                product_id: productId,
                product: orderProduct.product,
                imports: productImports,
                total_quantity: totalQuantity,
            };
        });

        return result;
    }

    /**
     * Get purchase processing information for a specific order detail
     * @param orderDetailId ID of the order detail to check
     * @returns Import information for the specific product
     */
    public async getOrderDetailPurchaseProcessing(orderDetail: IOrderDetailPurchaseProcessing) {
        if (!orderDetail || !orderDetail.product?.id || !orderDetail.order_id) {
            return {};
        }

        const productId = orderDetail.product?.id;
        const orderId = orderDetail.order_id;

        // 2. Get inventory transactions related to this order
        const inventoryTransactions = await this.db.inventories.findMany({
            where: { order_id: orderId },
            select: {
                id: true,
                code: true,
                time_at: true,
                order_id: true,
                shipping_plan_id: true,
                details: {
                    where: {
                        order_detail_id: orderDetail.id,
                    },
                    select: {
                        transaction_warehouses: {
                            select: {
                                quantity: true,
                            },
                        },
                    },
                },
            },
            orderBy: { time_at: 'asc' },
        });

        // 3. Format transactions for processing
        const importBatches = inventoryTransactions.map((transaction) => ({
            time_at: moment(transaction.time_at).format('YYYY-MM-DD'),
            code: transaction.code,
            shipping_plan_id: transaction.shipping_plan_id,
            transaction: transaction,
        }));

        // 4. Process imports for this product
        const productImports: any[] = [];
        let totalQuantity = 0;

        importBatches.forEach((batch) => {
            const transaction = batch.transaction;
            // With the filtered query, we only need to check if there are any details
            const hasDetails = transaction.details && transaction.details.length > 0;

            if (hasDetails) {
                // Sum quantities across all matching details (usually just one)
                const batchQuantity =
                    transaction.details?.reduce((sum, detail) => {
                        const transactionWarehouses = detail?.transaction_warehouses;
                        const convertQuantity =
                            Array.isArray(transactionWarehouses) && transactionWarehouses.length > 0
                                ? transactionWarehouses[0]?.quantity || 0
                                : 0;
                        return sum + convertQuantity;
                    }, 0) || 0;

                if (batchQuantity > 0) {
                    productImports.push({
                        time_at: batch.time_at,
                        code: batch.code,
                        shipping_plan_id: batch.shipping_plan_id,
                        quantity: batchQuantity,
                    });
                    totalQuantity += batchQuantity;
                } else {
                    productImports.push({
                        time_at: batch.time_at,
                        code: batch.code,
                        shipping_plan_id: batch.shipping_plan_id,
                        quantity: 0,
                    });
                }
            } else {
                productImports.push({
                    time_at: batch.time_at,
                    code: null,
                    shipping_plan_id: batch.shipping_plan_id || null,
                    quantity: 0,
                });
            }
        });

        const exports = await this.getOrderDetailExports(orderDetail);
        const totalExportQuantity = await this.calculateOrderDetailExportQuantity(orderDetail.id);

        return {
            product_id: productId,
            product: orderDetail.product,
            imports: productImports,
            total: totalQuantity,
            exports,
            total_export: totalExportQuantity,
        };
    }

    /**
     * Get purchase processing information for a specific order detail
     * @param orderDetailId ID of the order detail to check
     * @returns Import information for the specific product
     */
    public async getOrderDetailExportProcessing(orderDetail: IOrderDetailPurchaseProcessing) {
        if (!orderDetail || !orderDetail.product?.id || !orderDetail.order_id) {
            return {};
        }

        const productId = orderDetail.product?.id;

        const exports = await this.getOrderDetailExports(orderDetail);
        const totalExportQuantity = await this.calculateOrderDetailExportQuantity(orderDetail.id);

        return {
            product_id: productId,
            product: orderDetail.product,
            imports: exports,
            total: totalExportQuantity,
        };
    }

    // ✅ Thêm hàm mới để lấy dữ liệu xuất kho
    private async getOrderDetailExports(orderDetail: IOrderDetailPurchaseProcessing) {
        if (!orderDetail?.id) return [];

        // Lấy các transaction xuất kho cho OrderDetail này
        const exportTransactions = await this.db.transactionWarehouses.findMany({
            where: {
                inventory_detail: {
                    order_detail_id: orderDetail.id,
                },
                type: 'out',
            },
            select: {
                id: true,
                quantity: true,
                time_at: true,
                inventory: {
                    select: {
                        id: true,
                        code: true,
                    },
                },
            },
            orderBy: { time_at: 'asc' },
        });

        // Format dữ liệu xuất kho
        return exportTransactions.map((tx) => ({
            time_at: moment(tx.time_at).format('YYYY-MM-DD'),
            code: tx.inventory?.code || null,
            quantity: tx.quantity || 0,
        }));
    }

    // ✅ Thêm hàm mới để tính tổng số lượng đã xuất kho
    private async calculateOrderDetailExportQuantity(orderDetailId: number | undefined): Promise<number> {
        if (!orderDetailId) return 0;

        const result = await this.db.transactionWarehouses.aggregate({
            where: {
                inventory_detail: {
                    order_detail_id: orderDetailId,
                },
                type: 'out',
            },
            _sum: {
                quantity: true,
            },
        });

        return result._sum.quantity || 0;
    }

    public async approve(id: number, body: IApproveRequest): Promise<IIdResponse> {
        const orderData = await this.validateStatusApprove(id);

        const { files, ...restData } = body;
        let dataToUpdate: any = { ...restData };
        if (files && files.length > 0) {
            let filesUpdate = handleFiles(files, [], orderData.files || []);
            dataToUpdate.files = filesUpdate;
        }
        await this.repo.update({ id }, dataToUpdate);

        return { id };
    }

    async calculateAndUpdateOrderProcessing(
        orderData: IOrder,
        quantity: number,
        initQty: number,
        tx?: Prisma.TransactionClient,
    ) {
        const percent = initQty > 0 ? (quantity / initQty) * 100 : 0;
        const isDone = percent >= 100 - (orderData?.tolerance || 0);
        await this.repo.update(
            { id: orderData.id },
            {
                delivery_progress: percent,
                isDone,
            },
            tx,
        );
    }
}
