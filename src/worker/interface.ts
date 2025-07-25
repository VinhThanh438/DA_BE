import type { Worker as BullMQWorker, Job } from 'bullmq';

export interface IWorker {
    worker: BullMQWorker;
    register(): Promise<IWorker>;
}

export interface JobHandler extends IWorker {
    handler(job: Job): Promise<void>;
}
