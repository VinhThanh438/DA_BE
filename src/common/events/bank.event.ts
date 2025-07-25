import eventbus from '@common/eventbus';
import { IPaymentCreatedEvent, IPaymentDeletedEvent } from '@common/interfaces/transaction.interface';
import logger from '@common/logger';
import { BankRepo } from '@common/repositories/bank.repo';
import { PaymentType } from '@config/app.constant';
import { EVENT_PAYMENT_CREATED, EVENT_PAYMENT_DELETED } from '@config/event.constant';

export class BankEvent {
    /**
     * Register bank event
     */
    private static bankRepo: BankRepo;

    static register(): void {
        this.bankRepo = new BankRepo();

        eventbus.on(EVENT_PAYMENT_CREATED, this.paymentCreatedHandler.bind(this));
        eventbus.on(EVENT_PAYMENT_DELETED, this.paymentDeletedHandler.bind(this));
    }

    private static async paymentCreatedHandler(body: IPaymentCreatedEvent): Promise<void> {
        try {
            const id = await this.bankRepo.update({ id: body.bank_id }, { balance: body.new_bank_balance });
            if (id) {
                logger.info('BankEvent.paymentCreatedHandler: balance updated successfully!');
            } else {
                logger.info('BankEvent.paymentCreatedHandler: bank not found!');
            }
        } catch (error: any) {
            logger.error('BankEvent.paymentCreatedHandler:', error);
        }
    }

    private static async paymentDeletedHandler(body: IPaymentDeletedEvent): Promise<void> {
        try {
            const bank = await this.bankRepo.findOne({ id: body.bank_id });
            if (bank) {
                const newBalance =
                    body.type === PaymentType.EXPENSE
                        ? Number(bank?.balance) + Number(body.refund)
                        : Number(bank?.balance) - Number(body.refund);
                await this.bankRepo.update({ id: body.bank_id }, { balance: newBalance });
                logger.info('BankEvent.paymentDeletedHandler: balance updated successfully!');
            } else {
                logger.info('BankEvent.paymentDeletedHandler: bank not found!');
            }
        } catch (error: any) {
            logger.error('BankEvent.paymentDeletedHandler:', error);
        }
    }
}
