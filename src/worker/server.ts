import logger from '@common/logger';
import { Router } from './router';
import { IWorker } from './interface';

/**
 * Abstraction around bullmq processor (Worker manager)
 */
export class WorkerServer {
    private workers: IWorker[] = [];

    public async setup(): Promise<void> {
        this.workers = await Router.register();
        logger.info(`WorkerServer: ${this.workers.length} jobs registered.`);
    }

    public async kill(): Promise<void> {
        const promises = this.workers.map((item) =>
            item.worker?.close().catch((e) => {
                logger.error('Error closing worker', e);
            }),
        );
        await Promise.all(promises);
        logger.info('WorkerServer: all jobs closed.');
    }
}
