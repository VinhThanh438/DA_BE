import { BaseService } from './base.service';
import { Orders, Prisma } from '.prisma/client';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { OrderRepo } from '@common/repositories/order.repo';
import { IOrder } from '@common/interfaces/order.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import { DEFAULT_EXCLUDED_FIELDS } from '@config/app.constant';
import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey, StatusCode } from '@common/errors';
import { ContractService } from './contract.service';
import { InvoiceService } from './invoice.service';
import { OrderExpenseService } from './order-expense.service';
import { ProductionService } from './production.service';
import { InventoryService } from './inventory.service';
import logger from '@common/logger';
import { RepresentativeRepo } from '@common/repositories/representative.repo';

export class OrderService extends BaseService<Orders, Prisma.OrdersSelect, Prisma.OrdersWhereInput> {
    private static instance: OrderService;
    private orderDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private productRepo: ProductRepo = new ProductRepo();
    private contractService: ContractService = ContractService.getInstance();
    private invoiceService: InvoiceService = InvoiceService.getInstance();
    private orderExpenseService: OrderExpenseService = OrderExpenseService.getInstance();
    private productionService: ProductionService = ProductionService.getInstance();
    private inventoryService: InventoryService = InventoryService.getInstance();
    private representativeRepo: RepresentativeRepo = new RepresentativeRepo();

    private constructor() {
        super(new OrderRepo());
    }

    public static getInstance(): OrderService {
        if (!this.instance) {
            this.instance = new OrderService();
        }
        return this.instance;
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        try {
            const data = await this.repo.paginate(query, true);
            return this.enrichOrderTotals(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.paginate: `, error);
            throw error;
        }
    }

    public async create(request: IOrder): Promise<IIdResponse> {
        let orderId = 0;

        await this.isExist({ code: request.code });

        await this.validateForeignKeys(request, {
            partner_id: this.partnerRepo,
            employee_id: this.employeeRepo,
            representative_id: this.representativeRepo,
        });

        const { details, contracts, invoices, order_expenses, productions, inventories, ...orderData } = request;

        await this.db.$transaction(async (tx) => {
            orderId = await this.repo.create(orderData as Partial<Orders>, tx);

            if (details && details.length > 0) {
                await this.validateForeignKeys(
                    details,
                    {
                        product_id: this.productRepo,
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

                if (invoices && invoices.length > 0) {
                    await Promise.all(
                        invoices.map((ele) => {
                            ele.order_id = orderId;
                            return this.invoiceService.createInvoice(ele, tx);
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
        });
        return { id: orderId };
    }
}
