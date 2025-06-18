import { JobHandler } from '@worker/interface';
import { Queue } from 'bull';
import { SendConfirmMailJob } from './jobs/send-confirm-mail.job';
import { SendPendingMailJob } from './jobs/send-pending-mail.job';
import { AddInterestLogsDailyJob } from './jobs/add-interest-log-daily.job';
import { HandleInterestLogJob } from './jobs/handle-loan-payment.job';

export class Router {
    static async register(): Promise<Queue[]> {
        const queues: JobHandler[] = [];

        // push job here
        queues.push(SendConfirmMailJob, SendPendingMailJob, AddInterestLogsDailyJob, HandleInterestLogJob);

        return Promise.all(queues.map((queue) => queue.register()));
    }
}
