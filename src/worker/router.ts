import { JobHandler } from '@worker/interface';
import { Queue } from 'bull';

export class Router {
    static async register(): Promise<Queue[]> {
        const queues: JobHandler[] = [];

        queues.push(
            // push job here
        );

        return Promise.all(queues.map((queue) => queue.register()));
    }
}
