import eventbus from '@common/eventbus';
import { IEventInvoiceCreated } from '@common/interfaces/invoice.interface';
import logger from '@common/logger';
import { QueueService } from '@common/services/queue.service';
import { EVENT_INVOICE_CREATED } from '@config/event.constant';
import { UPDATE_INVOICE_DATA_JOB } from '@config/job.constant';

export class InvoiceEvent {
    /**
     * Register Loan event
     */
    static register(): void {
        eventbus.on(EVENT_INVOICE_CREATED, this.invoiceCreatedHandler.bind(this));
    }

    private static async invoiceCreatedHandler(data: IEventInvoiceCreated): Promise<void> {
        try {
            await (await QueueService.getQueue(UPDATE_INVOICE_DATA_JOB)).add(UPDATE_INVOICE_DATA_JOB, data);
            logger.warn('InvoiceEvent.handler: invoice updated successfully.');
        } catch (error: any) {
            logger.error('InvoiceEvent.handler:', error);
        }
    }
}
