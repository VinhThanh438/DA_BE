import eventbus from '@common/eventbus';
import { IPaymentRequest } from '@common/interfaces/payment-request.interface';
import { IPaymentCreatedEvent } from '@common/interfaces/transaction.interface';
import logger from '@common/logger';
import { PaymentRequestRepo } from '@common/repositories/payment-request.repo';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { EVENT_PAYMENT_CREATED } from '@config/event.constant';

export class PaymentEvent {
    /**
     * Register Payment event
     */
    private static transactionRepo: TransactionRepo;
    private static paymentRequestRepo: PaymentRequestRepo;

    static register(): void {
        this.transactionRepo = new TransactionRepo();
        this.paymentRequestRepo = new PaymentRequestRepo();
        eventbus.on(EVENT_PAYMENT_CREATED, this.paymentCreatedHandler.bind(this));
    }

    private static async paymentCreatedHandler(data: IPaymentCreatedEvent): Promise<void> {
        try {
            const { payment_request_id, new_bank_balance, bank_id, ...transactionData } = data;
            const transactionRequests = [];
            if (payment_request_id) {
                const paymentRequest = (await this.paymentRequestRepo.findOne(
                    { id: payment_request_id },
                    true,
                )) as IPaymentRequest;
                if (paymentRequest && paymentRequest.details) {
                    for (const detail of paymentRequest.details) {
                        transactionRequests.push({
                            ...transactionData,
                            order: detail.order_id ? { connect: { id: detail.order_id } } : undefined,
                            invoice: detail.invoice_id ? { connect: { id: detail.invoice_id } } : undefined,
                            order_type: paymentRequest.type,
                        });
                    }
                }
            }
            if (transactionRequests.length > 0) {
                await this.transactionRepo.createMany(transactionRequests);
                logger.info('PaymentEvent.paymentCreatedHandler: Successfully!');
            } else {
                logger.warn('PaymentEvent.paymentCreatedHandler: No payment request details found.');
            }
        } catch (error: any) {
            logger.error('PaymentEvent.paymentCreatedHandler:', error);
        }
    }
}
