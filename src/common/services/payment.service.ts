import { BaseService } from './base.service';
import { Payments, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { IPayment } from '@common/interfaces/payment.interface';
import { PaymentRepo } from '@common/repositories/payment.repo';
import { PaymentRequestRepo } from '@common/repositories/payment-request.repo';
import { handleFiles } from '@common/helpers/handle-files';
import { deleteFileSystem } from '@common/helpers/delete-file-system';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { PaymentRequestStatus, TransactionOrderType, PaymentRequestType } from '@config/app.constant';
import { PaymentRequestDetailRepo } from '@common/repositories/payment-request-details.repo';
import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey, StatusCode } from '@common/errors';
import { OrderRepo } from '@common/repositories/order.repo';
import { InvoiceRepo } from '@common/repositories/invoice.repo';

export class PaymentService extends BaseService<Payments, Prisma.PaymentsSelect, Prisma.PaymentsWhereInput> {
    private static instance: PaymentService;
    private paymentRequestRepo: PaymentRequestRepo = new PaymentRequestRepo();
    private transactionRepo: TransactionRepo = new TransactionRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private paymentRequestDetailRepo: PaymentRequestDetailRepo = new PaymentRequestDetailRepo();
    private invoiceRepo: InvoiceRepo = new InvoiceRepo();

    private constructor() {
        super(new PaymentRepo());
    }

    public static getInstance(): PaymentService {
        if (!this.instance) {
            this.instance = new PaymentService();
        }
        return this.instance;
    }

    public async create(request: Partial<IPayment>): Promise<IIdResponse> {
        await this.validateForeignKeys(request, {
            payment_request_id: this.paymentRequestRepo,
            order_id: this.orderRepo,
            invoice_id: this.invoiceRepo,
        });

        const id = await this.repo.create(request);
        return { id };
    }

    public async update(id: number, request: Partial<IPayment>): Promise<IIdResponse> {
        await this.findById(id);
        await this.validateForeignKeys(request, {
            payment_request_id: this.paymentRequestRepo,
            order_id: this.orderRepo,
            invoice_id: this.invoiceRepo,
        });

        await this.repo.update({ id }, request);

        return { id };
    }

    public async approve(id: number, body: IPayment): Promise<IIdResponse> {
        const paymentExists = await this.findById(id) as IPayment;
        if (paymentExists?.status !== PaymentRequestStatus.PENDING) {
            throw new APIError({
                message: `common.status.${StatusCode.BAD_REQUEST}`,
                status: ErrorCode.BAD_REQUEST,
                errors: [`status.${ErrorKey.INVALID}`],
            });
        }

        await this.db.$transaction(async (tx) => {
            await this.repo.update({ id }, body, tx);

            // update transaction
            if (body.status === PaymentRequestStatus.CONFIRMED && paymentExists?.payment_request_id) {
                const aggregation = await this.paymentRequestDetailRepo.aggregate(
                    { payment_request_id: paymentExists.payment_request_id },
                    {
                        _sum: {
                            amount: true,
                        },
                    },
                    tx,
                );

                const totalAmount = aggregation._sum.amount || 0;
                const orderCreateData =
                    paymentExists.type === PaymentRequestType.ORDER && paymentExists.order
                        ? { connect: { id: paymentExists.order.id } }
                        : null;

                await this.transactionRepo.create(
                    {
                        payment: { connect: { id } },
                        amount: totalAmount,
                        order: orderCreateData,
                    },
                    tx,
                );
            }
        });

        return { id };
    }
}
