import eventbus from '@common/eventbus';
import { ITransactionWarehouse } from '@common/interfaces/transaction-warehouse.interface';
import logger from '@common/logger';
import { TransactionWarehouseRepo } from '@common/repositories/transaction-warehouse.repo';
import { EVENT_INVENTORY_CREATED } from '@config/event.constant';

export class InventoryEvent {
    /**
     * Register inventory event
     */
    private static transactionWarehouseRepo: TransactionWarehouseRepo

    static register(): void {
        this.transactionWarehouseRepo = new TransactionWarehouseRepo()
        eventbus.on(EVENT_INVENTORY_CREATED, this.inventoryCreatedHandler.bind(this));
    }

    private static async inventoryCreatedHandler(data: ITransactionWarehouse[]): Promise<void> {
        try {
            await this.transactionWarehouseRepo.createMany(data);
            logger.info('InventoryEvent.inventoryCreatedHandler: Successfully!');
        } catch (error: any) {
            logger.error('InventoryEvent.inventoryCreatedHandler:', error);
        }
    }
}