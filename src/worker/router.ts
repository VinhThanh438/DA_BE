import { JobHandler } from '@worker/interface';
import { Queue } from 'bull';
import { DeleteFileDailyJob } from './jobs/delete-file-daily.job';
import { SendConfirmMailJob } from './jobs/send-confirm-mail.job';
import { SendPendingMailJob } from './jobs/send-pending-mail.job';

export class Router {
    static async register(): Promise<Queue[]> {
        const queues: JobHandler[] = [];

        // push job here
        queues.push(
            // DeleteFileDailyJob,
            SendConfirmMailJob,
            SendPendingMailJob
        );

        return Promise.all(queues.map((queue) => queue.register()));
    }
}
