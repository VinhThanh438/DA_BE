import eventbus from '@common/eventbus';
import { IEventProductHistoryUpdated } from '@common/interfaces/product.interface';
import logger from '@common/logger';
import { ProductHistorieRepo } from '@common/repositories/product-history.repo';
import { EVENT_PRODUCT_HISTORY_UPDATED } from '@config/event.constant';

export class ProductEvent {
    /**
     * Register product event
     */
    private static productHistoryRepo: ProductHistorieRepo;

    static register(): void {
        this.productHistoryRepo = new ProductHistorieRepo();

        eventbus.on(EVENT_PRODUCT_HISTORY_UPDATED, this.productHistoryUpdateddHandler.bind(this));
    }

    private static async productHistoryUpdateddHandler(body: IEventProductHistoryUpdated): Promise<void> {
        try {
            await this.productHistoryRepo.create({
                product_id: body.id,
                price: body.current_price,
            });
            logger.info('ProductEvent.productHistoryUpdateddHandler: product history created successfully!');
        } catch (error: any) {
            logger.error('ProductEvent.productHistoryUpdateddHandler:', error);
        }
    }
}
