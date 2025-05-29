import { BaseService } from './base.service';
import { Invoices, Prisma } from '.prisma/client';
import {
    ICommonDetails,
    IIdResponse,
    IPaginationInput,
    IPaginationResponse,
    IUpdateChildAction,
} from '@common/interfaces/common.interface';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { InvoiceRepo } from '@common/repositories/invoice.repo';
import { IInvoice } from '@common/interfaces/invoice.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import { DEFAULT_EXCLUDED_FIELDS, TransactionOrderType } from '@config/app.constant';
import { BankRepo } from '@common/repositories/bank.repo';
import { ContractRepo } from '@common/repositories/contract.repo';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { OrderRepo } from '@common/repositories/order.repo';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { IOrder } from '@common/interfaces/order.interface';
import { InvoiceDetailRepo } from '@common/repositories/invoice-detail.repo';
import { OrderService } from './order.service';

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

    private constructor() {
        super(new InvoiceRepo());
    }

    public static getInstance(): InvoiceService {
        if (!this.instance) {
            this.instance = new InvoiceService();
        }
        return this.instance;
    }

    public async attachPaymentInfoToOrder(invoice: IInvoice): Promise<IInvoice> {
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

    public async enrichInvoiceTotals(responseData: IPaginationResponse): Promise<IPaginationResponse> {
        const enrichedData = await Promise.all(
            responseData.data.map(async (invoice: any) => {
                let total_money = 0;
                let total_vat = 0;
                let total_commission = 0;

                for (const detail of invoice.details) {
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
                    ...invoice,
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

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const data = await this.repo.paginate(query, true);

        data.data = await Promise.all(data.data.map((invoice: IInvoice) => this.attachPaymentInfoToOrder(invoice)));

        const totalData = await this.enrichInvoiceTotals(data);

        totalData.data = await Promise.all(
            totalData.data.map(async (item: any) => {
                const totalAmount = item.total_vat;
                const totalQuantity = item.order
                    ? await this.orderService.calculateTotalConvertedQuantity(item.order.id)
                    : 0;
                const transactionData = await this.transactionRepo.findMany({
                    invoice_id: item.id,
                });
                const totalPayment = transactionData.reduce((sum, t) => sum + Number(t.amount || 0), 0);
                return {
                    ...item,
                    total_quantity: totalQuantity,
                    total_amount: totalAmount,
                    total_payment: totalPayment,
                    total_debt: totalAmount - totalPayment,
                };
            }),
        );

        return totalData;
    }

    public async createInvoice(request: Partial<IInvoice>, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        let invoiceId: number = 0;

        await this.isExist({ code: request.code });

        await this.validateForeignKeys(
            request,
            {
                order_id: this.orderRepo,
            },
            tx,
        );

        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const orderData = (await this.orderRepo.findOne({ id: request.order_id }, false, transaction)) as IOrder;
            request.partner_id = orderData.partner_id;
            request.employee_id = orderData.employee_id;
            const { details, order_id, partner_id, employee_id, ...invoiceData } = request;
            invoiceData.order = order_id ? ({ connect: { id: order_id } } as any) : undefined;
            invoiceData.partner = partner_id ? ({ connect: { id: partner_id } } as any) : undefined;
            invoiceData.employee = employee_id ? ({ connect: { id: employee_id } } as any) : undefined;

            invoiceId = await this.repo.create(invoiceData as Partial<Invoices>, transaction);

            if (details && details.length > 0) {
                await this.validateForeignKeys(
                    details,
                    {
                        order_detail_id: this.orderDetailRepo,
                    },
                    transaction,
                );

                const mappedDetails = await Promise.all(
                    details.map(async (item) => {
                        const { order_detail_id, key, ...rest } = item as ICommonDetails;
                        return {
                            ...rest,
                            invoice: invoiceId ? { connect: { id: invoiceId } } : undefined,
                            order_detail: order_detail_id ? { connect: { id: order_detail_id } } : undefined,
                        };
                    }),
                );
                await this.invoiceDetailRepo.createMany(mappedDetails, transaction);
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

        const { delete: deteleItems, update, add, ...body } = request;

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
}
