import logger from '@common/logger';
import { Job } from 'bullmq';
import { SEND_CONFIRM_MAIL_JOB as JOB_NAME } from '@config/job.constant';
import { MailService } from '@common/services/mail.service';
import { IJobSendConfirmEmailData } from '@common/interfaces/common.interface';
import { BaseJob } from './base.job';

export class SendConfirmMailJob extends BaseJob<IJobSendConfirmEmailData> {
    public readonly queueName = JOB_NAME;

    constructor() {
        super();
    }

    public static getInstance(): SendConfirmMailJob {
        return new SendConfirmMailJob();
    }

    public async handler(job: Job<IJobSendConfirmEmailData>): Promise<void> {
        try {
            logger.info(`Processing job: ${this.queueName}`);
            const data = {
                email: job.data.email,
                name: job.data.name,
                status: job.data.status,
            };
            MailService.sendConfirmMail(data);
            logger.info(`Job processed successfully: ${this.queueName}`);
        } catch (error) {
            logger.error(`Error processing job ${this.queueName}: `, error);
        }
    }
}
