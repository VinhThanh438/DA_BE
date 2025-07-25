import { Processor, Queue, QueueOptions } from 'bullmq';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';
import logger from '@common/logger';
import { WorkerOptions, Worker } from 'bullmq';

export class QueueService {
    private static queues: Map<string, Queue> = new Map();
    private static queueOptions: QueueOptions;

    public static async getQueue(queueName: string): Promise<Queue> {
        let queue = this.queues.get(queueName);
        if (!queue) {
            this.queueOptions = await RedisAdapter.getQueueOptions();
            queue = new Queue(queueName, { connection: this.queueOptions });
            queue.on('error', (error) => {
                logger.error(`Error process queue`, { error, queueName });
            });
            this.queues.set(queueName, queue);
        }
        return queue;
    }

    public static async closeAllQueues(): Promise<void> {
        const promises: Promise<void>[] = [];
        this.queues.forEach((queue) => {
            promises.push(queue.close());
        });
        await Promise.all(promises);
        this.queues.clear();
        logger.info('All queues have been closed successfully');
    }

    public static async cleanQueues(
        type: 'completed' | 'wait' | 'delayed' | 'failed' | 'active' | 'paused' = 'completed',
        grace: number = 0,
    ): Promise<void> {
        const promises: Promise<any>[] = [];
        this.queues.forEach((queue) => {
            promises.push(queue.clean(grace, 1000, type));
        });
        await Promise.all(promises);
        logger.info('All queues have been cleaned');
    }

    public static async createWorker(opts: {
        queueName: string;
        processor: Processor;
        options?: WorkerOptions;
    }): Promise<Worker> {
        if (!this.queueOptions) {
            this.queueOptions = await RedisAdapter.getQueueOptions();
        }

        return new Worker(opts.queueName, opts.processor, {
            connection: this.queueOptions.connection,
            ...(opts.options || {}),
        });
    }
}
