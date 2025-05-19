import eventbus from '@common/eventbus';
import logger from '@common/logger';
import { EVENT_INVENTORY_CREATED } from '@config/event.constant';

export class InventoryEvent {
    /**
     * Register inventory event
     */
    static register(): void {
        eventbus.on(EVENT_INVENTORY_CREATED, this.inventoryCreatedHandler);
    }

    private static async inventoryCreatedHandler(data: any): Promise<void> {
        try {
            logger.info('InventoryEvent.inventoryCreatedHandler: Successfully!');
        } catch (error: any) {
            logger.error('InventoryEvent.inventoryCreatedHandler:', error.message);
        }
    }
}
