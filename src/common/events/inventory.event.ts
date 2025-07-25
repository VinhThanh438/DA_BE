import eventbus from '@common/eventbus';
import { TimeAdapter } from '@common/infrastructure/time.adapter';
import { IGateLog } from '@common/interfaces/gate-log.interface';
import { IEventInventoryApproved } from '@common/interfaces/inventory.interface';
import logger from '@common/logger';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { GateLogRepo } from '@common/repositories/gate-log.repo';
import { InventoryRepo } from '@common/repositories/inventory.repo';
import { CommonApproveStatus } from '@config/app.constant';
import {
    EVENT_CREATE_GATELOG,
    EVENT_DISABLE_UPDATE_INVENTORY,
    EVENT_INVENTORY_APPROVED,
    EVENT_ORDER_IMPORT_QUANTITY,
} from '@config/event.constant';

export class InventoryEvent {
    /**
     * Register inventory event
     */
    private static orderDetailRepo: CommonDetailRepo;
    private static gateLogRepo: GateLogRepo;
    private static inventoryRepo: InventoryRepo;

    public static register(): void {
        this.gateLogRepo = new GateLogRepo();
        this.orderDetailRepo = new CommonDetailRepo();
        this.inventoryRepo = new InventoryRepo();

        eventbus.on(EVENT_INVENTORY_APPROVED, this.inventoryCreatedHandler.bind(this));
        eventbus.on(EVENT_ORDER_IMPORT_QUANTITY, this.updateImportQuantityHandler.bind(this));
        eventbus.on(EVENT_CREATE_GATELOG, this.gateLogCreatedHandler.bind(this));
        eventbus.on(EVENT_DISABLE_UPDATE_INVENTORY, this.disableUpdateInventoryHandler.bind(this));
    }

    private static async disableUpdateInventoryHandler(data: { id: number }): Promise<void> {
        try {
            const { id } = data;
            await this.inventoryRepo.update({ id }, { is_update_locked: true });
            logger.info('InventoryEvent.disableUpdateInventoryHandler: Successfully!');
        } catch (error: any) {
            logger.error('InventoryEvent.disableUpdateInventoryHandler:', error);
        }
    }

    private static async inventoryCreatedHandler(body: IEventInventoryApproved): Promise<void> {
        try {
            if (body.status && body.status === CommonApproveStatus.CONFIRMED) {
                await this.inventoryRepo.update({ id: body.id }, { confirmed_at: TimeAdapter.currentDate() });
                logger.info('InventoryEvent.inventoryCreatedHandler: updated successfully!');
            }
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

    private static async gateLogCreatedHandler(data: IGateLog): Promise<void> {
        try {
            await this.gateLogRepo.create(data);
            logger.info('InventoryEvent.gateLogCreatedHandler: Successfully!');
        } catch (error: any) {
            logger.error('InventoryEvent.gateLogCreatedHandler:', error);
        }
    }
}
