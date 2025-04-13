import logger from '@common/logger';
import { DoneCallback, Job, Queue } from 'bull';
import { SEND_PENDING_MAIL_JOB as JOB_NAME } from '@config/job.constant';
import { QueueService } from '@common/services/queue.service';
import { IJobSendPendingEmailData } from '@config/app.constant';
import { MailService } from '@common/services/mail.service';

export class SendPendingMailJob {
    static async register(): Promise<Queue<unknown>> {
        logger.info(`Listening to queue: ${JOB_NAME}`);
        const queue = await QueueService.getQueue<IJobSendPendingEmailData>(JOB_NAME);

        await queue.process(this.handler);
        return queue;
    }

    public static async handler(job: Job<IJobSendPendingEmailData>, done: DoneCallback): Promise<void> {
        try {
            logger.debug(`Process job ${JOB_NAME}-${job.id} with data: `, job.data);
            const data = {
                email: job.data.email,
                name: job.data.name,
            } as unknown as IJobSendPendingEmailData;
            MailService.sendPendingMail(data);
            logger.debug(`Processed job ${JOB_NAME}-${job.id}`);
            done();
        } catch (error) {
            logger.error(`Process ${JOB_NAME} error: `, error);
            done(error as Error);
        }
    }
}
