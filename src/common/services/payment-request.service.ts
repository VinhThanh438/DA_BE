import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { BaseService } from './base.service';
import { PaymentRequests, Prisma } from '.prisma/client';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { IPaymentRequest } from '@common/interfaces/payment-request.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { PaymentRequestRepo } from '@common/repositories/payment-request.repo';
import { DEFAULT_EXCLUDED_FIELDS } from '@config/app.constant';
import { PaymentRequestDetailRepo } from '@common/repositories/payment-request-details.repo';
import { OrderRepo } from '@common/repositories/order.repo';
import { InvoiceRepo } from '@common/repositories/invoice.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';

export class PaymentRequestService extends BaseService<
    PaymentRequests,
    Prisma.PaymentRequestsSelect,
    Prisma.PaymentRequestsWhereInput
> {
    private static instance: PaymentRequestService;
    private paymentRequestDetails: PaymentRequestDetailRepo = new PaymentRequestDetailRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private invoiceRepo: InvoiceRepo = new InvoiceRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();

    private constructor() {
        super(new PaymentRequestRepo());
    }

    public static getInstance(): PaymentRequestService {
        if (!this.instance) {
            this.instance = new PaymentRequestService();
        }
        return this.instance;
    }

    public async createPaymentRequest(
        request: Partial<IPaymentRequest>,
        tx?: Prisma.TransactionClient,
    ): Promise<IIdResponse> {
        let paymentRequestId: number = 0;
        await this.validateForeignKeys(
            request,
            {
                employee_id: this.employeeRepo,
                approver_id: this.employeeRepo,
                partner_id: this.partnerRepo,
            },
            tx,
        );

        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const { details, ...paymentRequestData } = request;

            paymentRequestId = await this.repo.create(paymentRequestData as Partial<PaymentRequest>, transaction);

            if (details && details.length > 0) {
                await this.validateForeignKeys(
                    details,
                    {
                        order_id: this.orderRepo,
                        invoice_id: this.invoiceRepo,
                    },
                    transaction,
                );

                const mappedDetails = details.map((item) => {
                    const { order_id, invoice_id, ...rest } = item;
                    return {
                        ...rest,
                        order: order_id ? { connect: { id: order_id } } : undefined,
                        invoice: invoice_id ? { connect: { id: invoice_id } } : undefined,
                        payment_request: paymentRequestId ? { connect: { id: paymentRequestId } } : undefined,
                    };
                });

                const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);

                await this.paymentRequestDetails.createMany(filteredData, transaction);
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

        return { id: paymentRequestId };
    }

    public async updatePaymentRequest(id: number, request: Partial<IPaymentRequest>): Promise<IIdResponse> {
        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            employee_id: this.employeeRepo,
            approver_id: this.employeeRepo,
        });

        const updatedId = await this.repo.update({ id }, request);

        return { id: updatedId };
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const result = await this.repo.paginate(query);
        result.data = result.data.map((item: IPaymentRequest) => {
            const { details, ...rest } = item;
            const totalAmount = details.reduce((acc: number, detail) => {
                const amount = Number(detail.amount) || 0;
                return acc + amount;
            }, 0);
            return {
                ...rest,
                total_amount: totalAmount,
            };
        });
        return result;
    }
}
