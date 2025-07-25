import eventbus from '@common/eventbus';
import { IDebt } from '@common/interfaces/debt.interface';
import logger from '@common/logger';
import { DebtRepo } from '@common/repositories/debt.repo';
import { EVENT_DEBT_INCURRED } from '@config/event.constant';

export class DebtEvent {
    private static debtRepo: DebtRepo = new DebtRepo();
    /**
     * Register Debt event
     */
    static register(): void {
        eventbus.on(EVENT_DEBT_INCURRED, this.DebtIncurredHandler.bind(this));
    }

    private static async DebtIncurredHandler(body: IDebt): Promise<void> {
        try {
            await this.debtRepo.create(body);
            logger.info('DebtEvent.DebtIncurredHandler: Debt created successfully!');
        } catch (error: any) {
            logger.error('DebtEvent.DebtIncurredHandler:', error);
        }
    }
}
