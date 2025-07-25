import logger from '@common/logger';
import { Job } from 'bullmq';
import { SEND_REJECT_QUOTATION_MAIL_JOB as JOB_NAME } from '@config/job.constant';
import { MailService } from '@common/services/mail.service';
import { IJobSendRejectQuotationEmailData } from '@common/interfaces/common.interface';
import { BaseJob } from './base.job';

export class RejectQuotationMailJob extends BaseJob<IJobSendRejectQuotationEmailData> {
    public readonly queueName = JOB_NAME;

    constructor() {
        super();
    }

    public static getInstance(): RejectQuotationMailJob {
        return new RejectQuotationMailJob();
    }

    public async handler(job: Job<IJobSendRejectQuotationEmailData>): Promise<void> {
        const data = job.data;
        try {
            logger.info(`Processing job: ${this.queueName}`);
            MailService.sendRejectQuotationMail(data);
            logger.info(`Job processed successfully: ${this.queueName}`);
        } catch (error) {
            logger.error(`Error processing job ${this.queueName}: `, error);
        }
    }
}
