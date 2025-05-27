import eventbus from '@common/eventbus';
import { ITransactionWarehouse } from '@common/interfaces/transaction-warehouse.interface';
import logger from '@common/logger';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { TransactionWarehouseRepo } from '@common/repositories/transaction-warehouse.repo';
import { EVENT_INVENTORY_CREATED, EVENT_ORDER_IMPORT_QUANTITY } from '@config/event.constant';

export class InventoryEvent {
    /**
     * Register inventory event
     */
    private static transactionWarehouseRepo: TransactionWarehouseRepo;
    private static orderDetailRepo: CommonDetailRepo;

    static register(): void {
        this.transactionWarehouseRepo = new TransactionWarehouseRepo();
        eventbus.on(EVENT_INVENTORY_CREATED, this.inventoryCreatedHandler.bind(this));
        eventbus.on(EVENT_ORDER_IMPORT_QUANTITY, this.updateImportQuantityHandler.bind(this));
    }

    private static async inventoryCreatedHandler(data: ITransactionWarehouse[]): Promise<void> {
        try {
            await this.transactionWarehouseRepo.createMany(data);
            logger.info('InventoryEvent.inventoryCreatedHandler: Successfully!');
        } catch (error: any) {
            logger.error('InventoryEvent.inventoryCreatedHandler:', error);
        }
    }

    private static async updateImportQuantityHandler(data: Record<number, number>): Promise<void> {
        try {
            const dataToUpdate: { id: number; imported_quantity: number }[] = [];
            for (const [key, value] of Object.entries(data)) {
                dataToUpdate.push({ id: Number(key), imported_quantity: value });
            }
            await this.orderDetailRepo.updateMany(dataToUpdate);
            logger.info('InventoryEvent.updateImportQuantityHandler: Successfully!');
        } catch (error: any) {
            logger.error('InventoryEvent.updateImportQuantityHandler:', error);
        }
    }
}
