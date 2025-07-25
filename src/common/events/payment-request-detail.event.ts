import eventbus from '@common/eventbus';
import { IPaymentCreatedEvent } from '@common/interfaces/transaction.interface';
import logger from '@common/logger';
import { PaymentRequestDetailRepo } from '@common/repositories/payment-request-details.repo';
import { PaymentRequestDetailStatus } from '@config/app.constant';
import { EVENT_PAYMENT_CREATED } from '@config/event.constant';

export class PaymentRequestDetailEvent {
    /**
     * Register Payment Request event
     */
    private static paymentRequestDetailRepo: PaymentRequestDetailRepo;

    static register(): void {
        this.paymentRequestDetailRepo = new PaymentRequestDetailRepo();

        eventbus.on(EVENT_PAYMENT_CREATED, this.paymentCreatedHandler.bind(this));
    }

    private static async paymentCreatedHandler(data: IPaymentCreatedEvent): Promise<void> {
        try {
            const { payment_request_detail_id, ...paymentData } = data;
            if (payment_request_detail_id) {
                await this.paymentRequestDetailRepo.update(
                    {
                        id: payment_request_detail_id,
                    },
                    {
                        status: PaymentRequestDetailStatus.PAYMENTED,
                    },
                );
            }
            logger.info('PaymentRequestDetailEvent.paymentCreatedHandler: Successfully!');
        } catch (error: any) {
            logger.error('PaymentRequestDetailEvent.paymentCreatedHandler:', error);
        }
    }
}
