import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { BaseService } from './base.service';
import { PaymentRequests, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { IPaymetRequest } from '@common/interfaces/payment-request.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { PaymentRequestRepo } from '@common/repositories/payment-request.repo';
import { DEFAULT_EXCLUDED_FIELDS } from '@config/app.constant';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { PaymentRequestDetailRepo } from '@common/repositories/payment-request-details.repo';

export class PaymentRequestService extends BaseService<
    PaymentRequests,
    Prisma.PaymentRequestsSelect,
    Prisma.PaymentRequestsWhereInput
> {
    private static instance: PaymentRequestService;
    private paymentRequestDetails: PaymentRequestDetailRepo = new PaymentRequestDetailRepo();
    private orderDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();

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
        request: Partial<IPaymetRequest>,
        tx?: Prisma.TransactionClient,
    ): Promise<IIdResponse> {
        let paymentRequestId: number = 0;
        await this.validateForeignKeys(
            request,
            {
                employee_id: this.employeeRepo,
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
                        order_detail_id: this.orderDetailRepo,
                    },
                    transaction,
                );

                const mappedDetails = details.map((item) => {
                    const { order_detail_id, ...rest } = item;
                    return {
                        ...rest,
                        order_detail: order_detail_id ? { connect: { id: order_detail_id } } : undefined,
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

    public async updatePaymentRequest(id: number, request: Partial<IPaymetRequest>): Promise<IIdResponse> {
        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            employee_id: this.employeeRepo,
        });

        const updatedId = await this.repo.update({ id }, request);

        return { id: updatedId };
    }
}
