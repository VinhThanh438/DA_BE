import { Job } from 'bullmq';
import { ICreateOrderFromQuotation } from '@common/interfaces/quotation.interface';
import { QuotationService } from '@common/services/quotation.service';
import { CREATE_ORDER_FROM_QUOTATION_JOB as JOB_NAME } from '@config/job.constant';
import { BaseJob } from './base.job';
import logger from '@common/logger';

export class CreateOrderFromQuotationJob extends BaseJob<ICreateOrderFromQuotation> {
    public readonly queueName = JOB_NAME;
    private readonly quotationService: QuotationService;

    constructor() {
        super();
        this.quotationService = QuotationService.getInstance();
    }

    public static getInstance(): CreateOrderFromQuotationJob {
        return new CreateOrderFromQuotationJob();
    }

    public async handler(job: Job<ICreateOrderFromQuotation>): Promise<void> {
        const { id } = job.data;
        try {
            logger.info(`Processing job: ${this.queueName}`);
            await this.quotationService.createOrderFromQuotation(Number(id));
            logger.info(`Job processed successfully: ${this.queueName}`);
        } catch (error) {
            logger.error(`Error processing job ${this.queueName}: `, error);
        }
    }
}
