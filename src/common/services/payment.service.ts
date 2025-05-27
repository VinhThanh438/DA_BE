import { BaseService } from './base.service';
import { Payments, Prisma } from '.prisma/client';
import { IApproveRequest, IIdResponse } from '@common/interfaces/common.interface';
import { IPayment } from '@common/interfaces/payment.interface';
import { PaymentRepo } from '@common/repositories/payment.repo';
import { PaymentRequestRepo } from '@common/repositories/payment-request.repo';
import { handleFiles } from '@common/helpers/handle-files';
import { deleteFileSystem } from '@common/helpers/delete-file-system';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { PaymentRequestStatus, PaymentType, TransactionType } from '@config/app.constant';
import { PaymentRequestDetailRepo } from '@common/repositories/payment-request-details.repo';
import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey, StatusCode } from '@common/errors';
import { OrderRepo } from '@common/repositories/order.repo';
import { InvoiceRepo } from '@common/repositories/invoice.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { BankRepo } from '@common/repositories/bank.repo';
import eventbus from '@common/eventbus';
import { EVENT_PAYMENT_APPROVED } from '@config/event.constant';
import { ITransaction } from '@common/interfaces/transaction.interface';

export class PaymentService extends BaseService<Payments, Prisma.PaymentsSelect, Prisma.PaymentsWhereInput> {
    private static instance: PaymentService;
    private paymentRequestRepo: PaymentRequestRepo = new PaymentRequestRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private invoiceRepo: InvoiceRepo = new InvoiceRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private bankRepo: BankRepo = new BankRepo();

    private constructor() {
        super(new PaymentRepo());
    }

    public static getInstance(): PaymentService {
        if (!this.instance) {
            this.instance = new PaymentService();
        }
        return this.instance;
    }

    public async createPayment(request: Partial<IPayment>): Promise<IIdResponse> {
        try {
            await this.validateForeignKeys(request, {
                payment_request_id: this.paymentRequestRepo,
                order_id: this.orderRepo,
                invoice_id: this.invoiceRepo,
                partner_id: this.partnerRepo,
                bank_id: this.bankRepo,
            });

            const { id, payment_request_id, order_id, invoice_id, partner_id, bank_id, ...paymentData } = request;
            paymentData.payment_request = payment_request_id
                ? ({ connect: { id: payment_request_id } } as any)
                : undefined;
            paymentData.order = order_id ? ({ connect: { id: order_id } } as any) : undefined;
            paymentData.invoice = invoice_id ? ({ connect: { id: invoice_id } } as any) : undefined;
            paymentData.partner = partner_id ? ({ connect: { id: partner_id } } as any) : undefined;
            paymentData.bank = bank_id ? ({ connect: { id: bank_id } } as any) : undefined;

            const resultId = await this.repo.create(paymentData);
            return { id: resultId };
        } catch (error) {
            if (request.files && request.files.length > 0) {
                deleteFileSystem(request.files);
            }
            throw error;
        }
    }

    public async updatePayment(id: number, request: Partial<IPayment>): Promise<IIdResponse> {
        const { files_add, files_delete, ...paymentData } = request;
        try {
            const paymentExist = await this.findById(id);
            await this.validateForeignKeys(request, {
                payment_request_id: this.paymentRequestRepo,
                order_id: this.orderRepo,
                invoice_id: this.invoiceRepo,
                partner_id: this.repo,
            });

            // handle files
            let filesUpdate = handleFiles(files_add, files_delete, paymentExist?.files);

            await this.repo.update(
                { id },
                {
                    ...paymentData,
                    ...(filesUpdate !== null && { files: filesUpdate }),
                },
            );

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
        // const payment = await this.findOne({ id, status: PaymentRequestStatus.PENDING }, false);
        // if (!payment) {
        //     throw new APIError({
        //         message: `common.status.${StatusCode.BAD_REQUEST}`,
        //         status: ErrorCode.BAD_REQUEST,
        //         errors: [`payment.${ErrorKey.INVALID}`],
        //     });
        // }
        const payment = await this.validateStatusApprove(id);
        console.log('payment: ', payment);

        const paymentUpdateId = await this.repo.update({ id }, body);

        if (paymentUpdateId) {
            const transaction = {
                amount: payment.amount,
                bank: payment.bank_id ? { connect: { id: payment.bank_id } } : undefined,
                payment: { connect: { id } },
                type: payment.type && payment.type === PaymentType.INCOME ? TransactionType.IN : TransactionType.OUT,
                invoice: payment.invoice_id ? { connect: { id: payment.invoice_id } } : undefined,
                order: payment.order_id ? { connect: { id: payment.order_id } } : undefined,
                partner: payment.partner_id ? { connect: { id: payment.partner_id } } : undefined,
            };
            eventbus.emit(EVENT_PAYMENT_APPROVED, transaction as ITransaction);
        }

        return { id };
    }
}
