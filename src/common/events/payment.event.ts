import eventbus from '@common/eventbus';
import { ITransaction } from '@common/interfaces/transaction.interface';
import logger from '@common/logger';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { EVENT_PAYMENT_APPROVED } from '@config/event.constant';

export class PaymentEvent {
    /**
     * Register Payment event
     */
    private static transactionRepo: TransactionRepo;

    static register(): void {
        this.transactionRepo = new TransactionRepo();
        eventbus.on(EVENT_PAYMENT_APPROVED, this.PaymentApprovedHandler.bind(this));
    }

    private static async PaymentApprovedHandler(data: ITransaction): Promise<void> {
        try {
            await this.transactionRepo.create(data);
            logger.info('PaymentEvent.PaymentApprovedHandler: Successfully!');
        } catch (error: any) {
            logger.error('PaymentEvent.PaymentApprovedHandler:', error);
        }
    }
}
