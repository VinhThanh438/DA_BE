import { BaseService } from './base.service';
import { Orders, Prisma } from '.prisma/client';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { OrderRepo } from '@common/repositories/order.repo';
import { IOrder } from '@common/interfaces/order.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import { DEFAULT_EXCLUDED_FIELDS, ShippingPlanStatus } from '@config/app.constant';
import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey, StatusCode } from '@common/errors';
import { ContractService } from './contract.service';
import { InvoiceService } from './invoice.service';
import { OrderExpenseService } from './order-expense.service';
import { ProductionService } from './production.service';
import { InventoryService } from './inventory.service';
import { RepresentativeRepo } from '@common/repositories/representative.repo';
import { BankRepo } from '@common/repositories/bank.repo';
import { UnitRepo } from '@common/repositories/unit.repo';
import { deleteFileSystem } from '@common/helpers/delete-file-system';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { handleFiles } from '@common/helpers/handle-files';
import { ShippingPlanRepo } from '@common/repositories/shipping-plan.repo';
import { IShippingPlan } from '@common/interfaces/shipping-plan.interface';

export class OrderService extends BaseService<Orders, Prisma.OrdersSelect, Prisma.OrdersWhereInput> {
    private static instance: OrderService;
    private orderDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private productRepo: ProductRepo = new ProductRepo();
    private bankRepo: BankRepo = new BankRepo();
    private unitRepo: UnitRepo = new UnitRepo();
    private contractService: ContractService = ContractService.getInstance();
    private orderExpenseService: OrderExpenseService = OrderExpenseService.getInstance();
    private productionService: ProductionService = ProductionService.getInstance();
    private inventoryService: InventoryService = InventoryService.getInstance();
    private representativeRepo: RepresentativeRepo = new RepresentativeRepo();
    private transactionRepo: TransactionRepo = new TransactionRepo();
    private shippingPlanRepo: ShippingPlanRepo = new ShippingPlanRepo();

    private constructor() {
        super(new OrderRepo());
    }

    public static getInstance(): OrderService {
        if (!this.instance) {
            this.instance = new OrderService();
        }
        return this.instance;
    }

    private async attachPaymentInfoToOrder(order: IOrder): Promise<IOrder> {
        const transactionData = await this.transactionRepo.findMany({
            order_id: order.id,
        });

        const totalPaid = transactionData
            .filter((t) => t.type === 'out' && !t.note?.toLowerCase().includes('hoa hồng'))
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const totalCommissionPaid = transactionData
            .filter((t) => t.note?.toLowerCase().includes('hoa hồng'))
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const totalOrderAmount = (order.details ?? []).reduce((sum, detail) => {
            const detailTotal = detail.quantity * detail.price;
            const detailVat = (detailTotal * (detail.vat || 0)) / 100;
            return sum + detailTotal + detailVat;
        }, 0);

        const detailsWithPayments = (order.details ?? []).map((detail: any) => {
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

            return {
                ...detail,
                amount_paid,
                amount_debt,
                commission_paid,
                commission_debt,
            };
        });

        return {
            ...order,
            details: detailsWithPayments,
        };
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const data = await this.repo.paginate(query, true);

        data.data = await Promise.all(data.data.map((order: IOrder) => this.attachPaymentInfoToOrder(order)));

        return this.enrichOrderTotals(data);
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

        const { shipping_plans, details, contracts, order_expenses, productions, inventories, ...orderData } =
            request;

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

                const mappedDetails = details.map((item) => {
                    const { product_id, unit_id, ...rest } = item;
                    return {
                        ...rest,
                        order: orderId ? { connect: { id: orderId } } : undefined,
                        product: product_id ? { connect: { id: product_id } } : undefined,
                        unit: unit_id ? { connect: { id: unit_id } } : undefined,
                    };
                });

                if (contracts && contracts.length > 0) {
                    await Promise.all(
                        contracts.map((ele) => {
                            ele.order_id = orderId;
                            return this.contractService.createContract(ele, tx);
                        }),
                    );
                }

                if (order_expenses && order_expenses.length > 0) {
                    await Promise.all(
                        order_expenses.map((ele) => {
                            ele.order_id = orderId;
                            return this.orderExpenseService.createOrderExpense(ele, tx);
                        }),
                    );
                }

                if (productions && productions.length > 0) {
                    await Promise.all(
                        productions.map((ele) => {
                            ele.order_id = orderId;
                            return this.productionService.createProduction(ele, tx);
                        }),
                    );
                }

                if (inventories && inventories.length > 0) {
                    await Promise.all(
                        inventories.map((ele) => {
                            ele.order_id = orderId;
                            return this.inventoryService.create(ele, tx);
                        }),
                    );
                }

                const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);

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
                    return { ...rest, order_id: orderId };
                });
                await this.shippingPlanRepo.createMany(data, tx);
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
            order_expenses,
            productions,
            inventories,
            files_add,
            files_delete,
            files,
            shipping_plans_add,
            shipping_plans_delete,
            shipping_plans_update,
            ...orderData
        } = request;

        try {
            const orderExists = await this.findById(id);
            if (!orderExists) {
                return { id };
            }

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
                    { ...orderData, ...(filesUpdate !== null && { files: filesUpdate }) } as Partial<Orders>,
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
                    await this.validateForeignKeys(
                        shipping_plans_add,
                        {
                            partner_id: this.partnerRepo,
                        },
                        tx,
                    );

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
                            id: this.shippingPlanRepo,
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
                    await this.orderDetailRepo.deleteMany({ id: { in: shipping_plans_delete } }, tx, false);
                }

                // handle invoices

                // handle expenses

                // handle productions

                // handle inventories
            });

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

    public async approveShippingPlan(id: number, body: IShippingPlan): Promise<IIdResponse> {
        const shippingPlanExist = await this.shippingPlanRepo.findOne({ id });
        if (shippingPlanExist?.status !== ShippingPlanStatus.PENDING) {
            throw new APIError({
                message: `common.status.${StatusCode.BAD_REQUEST}`,
                status: ErrorCode.BAD_REQUEST,
                errors: [`status.${ErrorKey.INVALID}`],
            });
        }
        await this.shippingPlanRepo.update({ id }, body);

        return { id };
    }
}
