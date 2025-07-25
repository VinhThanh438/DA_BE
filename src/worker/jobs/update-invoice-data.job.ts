import { Job } from 'bullmq';
import { BaseJob } from './base.job';
import { UPDATE_INVOICE_DATA_JOB as JOB_NAME } from '@config/job.constant';
import logger from '@common/logger';
import { InvoiceService } from '@common/services/invoice.service';
import { IEventInvoiceCreated } from '@common/interfaces/invoice.interface';

export class UpdateInvoiceDataJob extends BaseJob<IEventInvoiceCreated> {
    public readonly queueName = JOB_NAME;
    private readonly invoiceService: InvoiceService;

    constructor() {
        super();
        this.invoiceService = InvoiceService.getInstance();
    }

    public static getInstance(): UpdateInvoiceDataJob {
        return new UpdateInvoiceDataJob();
    }

    public async handler(job: Job<IEventInvoiceCreated>): Promise<void> {
        try {
            logger.info(`Processing job: ${this.queueName}`);
            await this.invoiceService.updateInvoiceTotal(job.data as IEventInvoiceCreated);
            logger.info(`Job processed successfully: ${this.queueName}`);
        } catch (error) {
            logger.error(`Error processing job ${this.queueName}: `, error);
        }
    }
}
