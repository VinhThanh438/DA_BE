import { BaseService } from './master/base.service';
import { Invoices, Prisma } from '.prisma/client';
import {
    IIdResponse,
    IPaginationInput,
    IPaginationResponse,
    IUpdateChildAction,
} from '@common/interfaces/common.interface';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { InvoiceRepo } from '@common/repositories/invoice.repo';
import { IEventInvoiceCreated, IInvoice, IInvoiceDetail, IInvoiceTotal } from '@common/interfaces/invoice.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import {
    DebtType,
    DEFAULT_EXCLUDED_FIELDS,
    InvoiceType,
    PartnerType,
    TransactionOrderType,
    TransactionType,
} from '@config/app.constant';
import { BankRepo } from '@common/repositories/bank.repo';
import { ContractRepo } from '@common/repositories/contract.repo';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { OrderRepo } from '@common/repositories/order.repo';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { IOrder, IOrderDetailPurchaseProcessing } from '@common/interfaces/order.interface';
import { InvoiceDetailRepo } from '@common/repositories/invoice-detail.repo';
import { OrderService } from './order.service';
import { CommonService } from './common.service';
import eventbus from '@common/eventbus';
import { EVENT_INVOICE_CREATED, EVENT_UPDATE_LOAN, EVENT_DEBT_INCURRED } from '@config/event.constant';
import { ShippingPlanRepo } from '@common/repositories/shipping-plan.repo';
import logger from '@common/logger';
import { InventoryRepo } from '@common/repositories/inventory.repo';
import { IInventory } from '@common/interfaces/inventory.interface';
import { FacilityOrderRepo } from '@common/repositories/facility-order.repo';
import { FacilityRepo } from '@common/repositories/facility.repo';
import { IDebt } from '@common/interfaces/debt.interface';

export class InvoiceService extends BaseService<Invoices, Prisma.InvoicesSelect, Prisma.InvoicesWhereInput> {
    private static instance: InvoiceService;
    private invoiceDetailRepo: InvoiceDetailRepo = new InvoiceDetailRepo();
    private orderDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private productRepo: ProductRepo = new ProductRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private bankRepo: BankRepo = new BankRepo();
    private contractRepo: ContractRepo = new ContractRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private transactionRepo: TransactionRepo = new TransactionRepo();
    private orderService = OrderService.getInstance();
    private shippingPlanRepo = new ShippingPlanRepo();
    private inventoryRepo: InventoryRepo = new InventoryRepo();
    private facilityRepo: FacilityRepo = new FacilityRepo();
    private facilityOrderRepo: FacilityOrderRepo = new FacilityOrderRepo();

    private constructor() {
        super(new InvoiceRepo());
    }

    public static getInstance(): InvoiceService {
        if (!this.instance) {
            this.instance = new InvoiceService();
        }
        return this.instance;
    }

    public async attachPaymentInfoToOrder(invoice: IInvoice): Promise<IInvoiceTotal> {
        const transactionData = await this.transactionRepo.findMany({
            invoice_id: invoice.id,
        });

        const totalPaid = transactionData
            .filter((t) => t.order_type === TransactionOrderType.ORDER)
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const totalCommissionPaid = transactionData
            .filter((t) => t.order_type === TransactionOrderType.COMMISSION)
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const detailInfos = await Promise.all(
            (invoice.details ?? []).map(async (detail) => {
                const info = await this.orderDetailRepo.findOne({ id: detail.order_detail_id });
                return { detail, info };
            }),
        );

        let total_amount_debt = 0;
        let total_commission_debt = 0;

        for (const { info } of detailInfos) {
            if (!info) continue;

            const quantity = Number(info.imported_quantity || 0);
            const price = Number(info.price || 0);
            const vat = Number(info.vat || 0);
            const commission = Number(info.commission || 0);

            const detailTotal = quantity * price;
            const detailVat = (detailTotal * vat) / 100;
            const detailTotalAfterVat = detailTotal + detailVat;
            const detailTotalCommission = (detailTotal * commission) / 100;

            total_amount_debt += detailTotalAfterVat - totalPaid;
            total_commission_debt += detailTotalCommission - totalCommissionPaid;
        }

        return {
            ...invoice,
            total_amount_paid: totalPaid,
            total_amount_debt,
            total_commission_paid: totalCommissionPaid,
            total_commission_debt,
        } as any;
    }

    public async handleInvoiceTotal(invoice: IInvoice): Promise<any> {
        let total_money = 0;
        let total_vat = 0;
        let total_commission = 0;

        // Check if details exists and is iterable
        if (invoice.details && Array.isArray(invoice.details) && invoice.details.length > 0) {
            for (const detail of invoice.details) {
                const orderDetail = await this.orderDetailRepo.findOne({ id: detail.order_detail_id });
                if (!orderDetail) continue;

                const quantity = Number(orderDetail.imported_quantity || orderDetail.quantity);
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
                ...invoice,
                total_money,
                total_vat,
                total_amount,
                total_commission,
            };
        } else {
            return {
                ...invoice,
                total_money,
                total_vat,
                total_amount: 0,
                total_commission,
            };
        }
    }

    public async enrichInvoiceTotals(responseData: IPaginationResponse): Promise<IPaginationResponse> {
        const enrichedData = await Promise.all(
            responseData.data.map(async (invoice: any) => {
                return this.handleInvoiceTotal(invoice);
            }),
        );

        return {
            ...responseData,
            data: enrichedData,
        };
    }

    public async findById(id: number): Promise<any> {
        let result = await this.repo.findOne({ id }, true);
        if (!result) {
            throw new APIError({
                message: `common.status.${StatusCode.BAD_REQUEST}`,
                status: ErrorCode.BAD_REQUEST,
                errors: [`invoice.${ErrorKey.NOT_FOUND}`],
            });
        }
        const detailsWithProgress = await Promise.all(
            (result as any)?.details?.map(async (x: any) => {
                const progress = await this.orderService.getOrderDetailPurchaseProcessing({
                    ...x.order_detail,
                    order_id: (result as any)?.order?.id,
                } as IOrderDetailPurchaseProcessing);

                return {
                    ...x,
                    order_detail: {
                        ...x.order_detail,
                        progress,
                    },
                };
            }),
        );

        return {
            ...result,
            details: detailsWithProgress,
        };
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const result = await this.repo.paginate(query, true);

        // Calculate summary totals
        let summary_total_money = 0;
        let summary_total_vat = 0;
        let summary_total_commission = 0;
        let summary_total_payment = 0;
        let summary_total_debt = 0;

        result.data = await Promise.all(
            result.data.map(async (item: any) => {
                // Calculate totals for this invoice using handleInvoiceTotal
                const invoiceWithTotals = await this.handleInvoiceTotal(item);

                const totalQuantity = item.order
                    ? await this.orderService.calculateTotalConvertedQuantity(item.order.id)
                    : 0;

                const transactionData = await this.transactionRepo.findMany({
                    invoice_id: item.id,
                });

                const totalPayment = transactionData.reduce((sum, t) => sum + Number(t.amount || 0), 0);
                const totalDebt = invoiceWithTotals.total_amount - totalPayment;

                const newDetails = await Promise.all(
                    item.details.map(async (detail: IInvoiceDetail) => {
                        const progress = await this.orderService.getOrderDetailPurchaseProcessing({
                            ...detail,
                            order_id: item.order?.id,
                            product: detail.order_detail?.product,
                        } as IOrderDetailPurchaseProcessing);

                        return {
                            ...detail,
                            progress,
                        };
                    }),
                );

                // Add to summary totals
                summary_total_money += invoiceWithTotals.total_money || 0;
                summary_total_vat += invoiceWithTotals.total_vat || 0;
                summary_total_commission += invoiceWithTotals.total_commission || 0;
                summary_total_payment += totalPayment;
                summary_total_debt += totalDebt;

                return {
                    ...invoiceWithTotals,
                    details: newDetails,
                    total_quantity: totalQuantity,
                    total_payment: parseFloat(totalPayment.toFixed(2)),
                    total_debt: parseFloat(totalDebt.toFixed(2)),
                };
            }),
        );

        const summary_total_amount = summary_total_money + summary_total_vat;

        return {
            ...result,
            summary: {
                total_money: parseFloat(summary_total_money.toFixed(2)),
                total_vat: parseFloat(summary_total_vat.toFixed(2)),
                total_amount: parseFloat(summary_total_amount.toFixed(2)),
                total_commission: parseFloat(summary_total_commission.toFixed(2)),
                total_payment: parseFloat(summary_total_payment.toFixed(2)),
                total_debt: parseFloat(summary_total_debt.toFixed(2)),
            },
        };
    }

    public async createSellInvoice(request: Partial<IInvoice>, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        let invoiceId: number = 0;

        await this.validateForeignKeys(
            request,
            {
                inventory_id: this.inventoryRepo,
                order_id: this.orderRepo,
            },
            tx,
        );

        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const inventoryData = (await this.inventoryRepo.findOne(
                { id: request.inventory_id },
                true,
                transaction,
            )) as IInventory;

            const partnerId = request.partner_id ? request.partner_id : inventoryData?.order?.partner_id;

            request.partner_id = partnerId;
            request.employee_id = inventoryData.employee_id;

            const { details, shipping_plan_id, ...invoiceData } = request;

            // Loại bỏ trường details khỏi dữ liệu tạo invoice
            const mappedData = this.autoMapConnection([{ ...invoiceData }]);
            const body = mappedData[0];

            if (details && details.length > 0) {
                invoiceData.content = await CommonService.getContent(details);
            }

            body.type = InvoiceType.SELL;
            invoiceId = await this.repo.create(body as Partial<Invoices>, transaction);

            if (shipping_plan_id) {
                const shippingPlan = await this.shippingPlanRepo.findOne({ id: shipping_plan_id }, false, transaction);
                if (shippingPlan && shippingPlan.vat && shippingPlan.vat > 0) {
                    const totalPrice = Number(shippingPlan.price || 0) * Number(shippingPlan.completed_quantity || 0);
                    const vat = (totalPrice * (shippingPlan.vat || 0)) / 100;

                    await this.transactionRepo.create(
                        {
                            type: TransactionType.OUT,
                            order_type: TransactionOrderType.DELIVERY,
                            shipping_plan: { connect: { id: shipping_plan_id } },
                            amount: totalPrice + vat,
                            invoice: { connect: { id: invoiceId } },
                            partner: { connect: { id: shippingPlan.partner_id } },
                            organization: { connect: { id: shippingPlan.organization_id } },
                            time_at: invoiceData.time_at,
                            order: shippingPlan.order_id ? { connect: { id: shippingPlan.order_id } } : undefined,
                            note: 'Phát sinh giảm cho vận chuyển có VAT',
                        },
                        transaction,
                    );

                    await this.shippingPlanRepo.update({ id: shipping_plan_id }, { is_done: true }, transaction);
                    logger.info(`Increased amount with VAT generated for shipping plan ID: ${shipping_plan_id}`);
                }
            }

            if (details && details.length > 0) {
                await this.validateForeignKeys(
                    details,
                    {
                        order_detail_id: this.orderDetailRepo,
                    },
                    transaction,
                );

                const mappedData = this.autoMapConnection(details, { invoice_id: invoiceId });

                await this.invoiceDetailRepo.createMany(mappedData, transaction);
            }
        };

        if (tx) {
            await runTransaction(tx);
        } else {
            await this.db.$transaction(async (transaction) => {
                await runTransaction(transaction);
            });
        }

        if (request.order_id) {
            eventbus.emit(EVENT_INVOICE_CREATED, { orderId: request.order_id, invoiceId } as IEventInvoiceCreated);
        }

        return { id: invoiceId };
    }

    public async createFacilityInvoice(
        request: Partial<IInvoice>,
        tx?: Prisma.TransactionClient,
    ): Promise<IIdResponse> {
        let invoiceId = 0;

        await this.validateForeignKeys(
            request,
            {
                facility_id: this.facilityRepo,
            },
            tx,
        );

        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const orderData = (await this.orderRepo.findOne({ id: request.order_id }, false, transaction)) as IOrder;

            request.partner_id = orderData.partner_id;
            request.employee_id = orderData.employee_id;

            const { facility_orders, ...invoiceData } = request;

            const mappedData = this.autoMapConnection([{ ...invoiceData }]);
            const body = mappedData[0];

            invoiceId = await this.repo.create(body as Partial<Invoices>, transaction);

            if (facility_orders && facility_orders.length > 0) {
                const mappedData = this.autoMapConnection(facility_orders, { invoice_id: invoiceId });

                await this.facilityOrderRepo.createMany(mappedData, transaction);
            }
        };

        if (tx) {
            await runTransaction(tx);
        } else {
            await this.db.$transaction(async (transaction) => {
                await runTransaction(transaction);
            });
        }

        if (request.order_id) {
            eventbus.emit(EVENT_INVOICE_CREATED, { orderId: request.order_id, invoiceId } as IEventInvoiceCreated);
        }

        return { id: invoiceId };
    }

    public async createInvoice(request: Partial<IInvoice>, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        let invoiceId: number = 0;

        await this.isExist({ code: request.code });

        if (request.type === InvoiceType.SELL) {
            return this.createSellInvoice(request, tx);
        } else if (request.type === InvoiceType.FACILITY) {
            return this.createFacilityInvoice(request, tx);
        }

        await this.validateForeignKeys(
            request,
            {
                order_id: this.orderRepo,
                shipping_plan_id: this.shippingPlanRepo,
            },
            tx,
        );

        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const orderData = (await this.orderRepo.findOne({ id: request.order_id }, false, transaction)) as IOrder;

            request.partner_id = orderData.partner_id;
            request.employee_id = orderData.employee_id;

            const { details, shipping_plan_id, ...invoiceData } = request;

            // Loại bỏ trường details khỏi dữ liệu tạo invoice
            const mappedData = this.autoMapConnection([{ ...invoiceData }]);
            const body = mappedData[0];

            if (details && details.length > 0) {
                invoiceData.content = await CommonService.getContent(details);
            }

            body.type = shipping_plan_id ? InvoiceType.DELIVERY : request.type;

            invoiceId = await this.repo.create(body as Partial<Invoices>, transaction);

            if (shipping_plan_id) {
                const shippingPlan = await this.shippingPlanRepo.findOne({ id: shipping_plan_id }, false, transaction);
                if (shippingPlan && shippingPlan.vat && shippingPlan.vat > 0) {
                    const totalPrice = Number(shippingPlan.price || 0) * Number(shippingPlan.completed_quantity || 0);
                    const vat = (totalPrice * (shippingPlan.vat || 0)) / 100;

                    await this.transactionRepo.create(
                        {
                            type: TransactionType.IN,
                            order_type: TransactionOrderType.DELIVERY,
                            shipping_plan: { connect: { id: shipping_plan_id } },
                            amount: totalPrice + vat,
                            invoice: { connect: { id: invoiceId } },
                            partner: { connect: { id: shippingPlan.partner_id } },
                            organization: { connect: { id: shippingPlan.organization_id } },
                            time_at: invoiceData.time_at,
                            order: shippingPlan.order_id ? { connect: { id: shippingPlan.order_id } } : undefined,
                            note: 'Phát sinh tăng cho vận chuyển có VAT',
                        },
                        transaction,
                    );

                    await this.shippingPlanRepo.update({ id: shipping_plan_id }, { is_done: true }, transaction);
                    logger.info(`Increased amount with VAT generated for shipping plan ID: ${shipping_plan_id}`);
                }
            }

            if (details && details.length > 0) {
                await this.validateForeignKeys(
                    details,
                    {
                        order_detail_id: this.orderDetailRepo,
                    },
                    transaction,
                );

                const mappedData = this.autoMapConnection(details, { invoice_id: invoiceId });

                await this.invoiceDetailRepo.createMany(mappedData, transaction);
            }
        };

        if (tx) {
            await runTransaction(tx);
        } else {
            await this.db.$transaction(async (transaction) => {
                await runTransaction(transaction);
            });
        }

        if (request.order_id) {
            const eventData = { orderId: request.order_id, invoiceId } as IEventInvoiceCreated;
            eventbus.emit(EVENT_INVOICE_CREATED, eventData);
            eventbus.emit(EVENT_UPDATE_LOAN, eventData);
        }

        return { id: invoiceId };
    }

    public async updateInvoice(id: number, request: Partial<IInvoice>): Promise<IIdResponse> {
        await this.findById(id);

        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            partner_id: this.partnerRepo,
            employee_id: this.employeeRepo,
            bank_id: this.bankRepo,
            contract_id: this.contractRepo,
            order_id: this.orderRepo,
        });

        const { delete: deleteItems, update, add, ...body } = request;

        await this.db.$transaction(async (tx) => {
            await this.repo.update({ id }, body as Partial<Invoices>, tx);

            const detailItems = [...(request.add || []), ...(request.update || [])];
            if (detailItems.length > 0) {
                await this.validateForeignKeys(
                    detailItems,
                    {
                        product_id: this.productRepo,
                        unit_id: this.productRepo,
                    },
                    tx,
                );
            }

            const mappedDetails: IUpdateChildAction = {
                add: this.mapDetails(request.add || [], { invoice_id: id }),
                update: this.mapDetails(request.update || [], { invoice_id: id }),
                delete: request.delete,
            };

            const filteredData = {
                add: this.filterData(mappedDetails.add, DEFAULT_EXCLUDED_FIELDS, ['key']),
                update: this.filterData(mappedDetails.update, DEFAULT_EXCLUDED_FIELDS, ['key']),
                delete: mappedDetails.delete,
            };

            if (
                filteredData.add.length > 0 ||
                filteredData.update.length > 0 ||
                (filteredData.delete?.length || 0) > 0
            ) {
                await this.updateChildEntity(filteredData, this.invoiceDetailRepo, tx);
            }
        });

        return { id };
    }

    public async updateInvoiceTotal(data: IEventInvoiceCreated): Promise<void> {
        const invoiceId = data.invoiceId;

        const invoice = await this.repo.findOne({ id: invoiceId }, true);

        const totalInvoice = await this.handleInvoiceTotal(invoice as IInvoice);
        const totalInvoiceDebt = await this.attachPaymentInfoToOrder(invoice as IInvoice);

        await this.repo.update(
            { id: invoiceId },
            {
                total_amount_paid: totalInvoiceDebt.total_amount_paid,
                total_amount_debt: totalInvoiceDebt.total_amount_debt,
                total_commission_paid: totalInvoiceDebt.total_commission_paid,
                total_commission_debt: totalInvoiceDebt.total_commission_debt,

                total_amount: totalInvoice.total_amount,
                total_vat: totalInvoice.total_vat,
                total_commission: totalInvoice.total_commission,
                total_money: totalInvoice.total_money,
            },
        );

        const debtData = {
            time_at: invoice?.invoice_date,
            debt_type: invoice?.type === InvoiceType.PURCHASE ? DebtType.EXPENSE : DebtType.INCOME,
            partner_id: invoice?.partner_id,
            invoice_id: invoiceId,
            order_id: invoice?.order_id,
            total_amount: totalInvoiceDebt.total_amount,
            total_commission: totalInvoiceDebt.total_commission,
        };
        eventbus.emit(EVENT_DEBT_INCURRED, debtData as IDebt);
    }
}
