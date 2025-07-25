import eventbus from '@common/eventbus';
import { IStockTracking } from '@common/interfaces/stock-tracking.interface';
import logger from '@common/logger';
import { StockTrackingRepo } from '@common/repositories/stock-tracking.repo';
import { StockTrackingService } from '@common/services/master/stock-tracking.service';
import { EVENT_INVENTORY_APPROVED } from '@config/event.constant';

export class StockTrackingEvent {
    /**
     * Register StockTracking event
     */
    private static stockTrackingService: StockTrackingService;

    static register(): void {
        this.stockTrackingService = StockTrackingService.getInstance();
        // eventbus.on(EVENT_INVENTORY_APPROVED, this.inventoryCreatedHandler.bind(this));
    }

    private static async inventoryCreatedHandler(body: IStockTracking[]): Promise<void> {
        try {
            await this.stockTrackingService.createMany(body);
            logger.info('StockTrackingEvent.inventoryCreatedHandler: StockTracking created/updated successfully!');
        } catch (error: any) {
            logger.error('StockTrackingEvent.inventoryCreatedHandler:', error);
        }
    }
}
