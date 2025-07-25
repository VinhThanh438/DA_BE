import { Job, Queue, Worker } from 'bullmq';
import logger from '@common/logger';
import { QueueService } from '@common/services/queue.service';
import { IWorker, JobHandler } from '@worker/interface';

export abstract class BaseJob<T = any> implements JobHandler {
    public worker!: Worker;
    public abstract readonly queueName: string;

    public abstract handler(job: Job<T>): Promise<void>;

    public async register(): Promise<IWorker> {
        logger.info(`Listening to job: ${this.queueName}`);

        this.worker = await QueueService.createWorker({
            queueName: this.queueName,
            processor: this.handler.bind(this),
        });

        this.worker.on('completed', (job) => {
            logger.debug(`[${this.queueName}] Job completed: ${job.id}`);
        });

        this.worker.on('failed', (job, err) => {
            logger.error(`[${this.queueName}] Job failed: ${job?.id}`, err);
        });

        return this;
    }

    public async clearOldCronJobs(queue: Queue) {
        const repeatableJobs = await queue.getRepeatableJobs();
        for (const job of repeatableJobs) {
            if (job.name === this.queueName) {
                await queue.removeRepeatableByKey(job.key);
            }
        }
    }
}
