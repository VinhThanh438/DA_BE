import logger from '@common/logger';
import { Job } from 'bullmq';
import { SEND_PENDING_MAIL_JOB as JOB_NAME } from '@config/job.constant';
import { MailService } from '@common/services/mail.service';
import { IJobSendPendingEmailData } from '@common/interfaces/common.interface';
import { BaseJob } from './base.job';

export class SendPendingMailJob extends BaseJob<IJobSendPendingEmailData> {
    public readonly queueName = JOB_NAME;

    constructor() {
        super();
    }

    public static getInstance(): SendPendingMailJob {
        return new SendPendingMailJob();
    }

    public async handler(job: Job<IJobSendPendingEmailData>): Promise<void> {
        try {
            logger.info(`Processing job: ${this.queueName}`);
            const data = {
                email: job.data.email,
                name: job.data.name,
            } as unknown as IJobSendPendingEmailData;
            MailService.sendPendingMail(data);
            logger.info(`Job processed successfully: ${this.queueName}`);
        } catch (error) {
            logger.error(`Error processing job ${this.queueName}: `, error);
        }
    }
}
