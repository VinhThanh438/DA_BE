import eventbus from '@common/eventbus';
import { IEventProductHistoryUpdated } from '@common/interfaces/product.interface';
import logger from '@common/logger';
import { ProductHistoryRepo } from '@common/repositories/product-history.repo';
import { EVENT_PRODUCT_HISTORY_UPDATED } from '@config/event.constant';

export class ProductEvent {
    /**
     * Register product event
     */
    private static productHistoryRepo: ProductHistoryRepo;

    static register(): void {
        this.productHistoryRepo = new ProductHistoryRepo();

        eventbus.on(EVENT_PRODUCT_HISTORY_UPDATED, this.productHistoryUpdatedHandler.bind(this));
    }

    private static async productHistoryUpdatedHandler(body: IEventProductHistoryUpdated): Promise<void> {
        try {
            await this.productHistoryRepo.create({
                product_id: body.id,
                price: body.current_price,
            });
            logger.info('ProductEvent.productHistoryUpdatedHandler: product history created successfully!');
        } catch (error: any) {
            logger.error('ProductEvent.productHistoryUpdatedHandler:', error);
        }
    }
}
