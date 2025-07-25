import { Job } from 'bullmq';
import logger from '@common/logger';
import { QueueService } from '@common/services/queue.service';
import { BaseJob } from './base.job';
import { DEFAULT_TIME_ZONE, PrefixFilePath } from '@config/app.constant';
import { DAILY_FILE_CLEANUP_JOB as JOB_NAME } from '@config/job.constant';
import path from 'path';
import { promises as fs } from 'fs';

const UPLOAD_DIR = path.join(__dirname, `../../../${PrefixFilePath}`);
const FILE_EXTENSIONS = ['.xlsx', '.xls', '.pdf'];

export class DeleteFileDailyJob extends BaseJob {
    public readonly queueName = JOB_NAME;

    private constructor() {
        super();
    }

    public static getInstance(): DeleteFileDailyJob {
        return new DeleteFileDailyJob();
    }

    public async register(): Promise<this> {
        await super.register();

        const queue = await QueueService.getQueue(this.queueName);

        const jobOpts = {
            jobId: this.queueName,
            repeat: {
                // cron: '* * * * *', // mỗi phút (test)
                cron: '0 3 * * *', // 3:00 AM mỗi ngày
                tz: DEFAULT_TIME_ZONE,
            },
        };

        await this.clearOldCronJobs(queue);

        await queue.add(this.queueName, { job: this.queueName }, jobOpts);

        return this;
    }

    public async handler(job: Job): Promise<void> {
        try {
            logger.info(`Processing job: ${this.queueName}`);

            const files = await fs.readdir(UPLOAD_DIR);

            for (const file of files) {
                if (FILE_EXTENSIONS.some((ext) => file.endsWith(ext))) {
                    const filePath = path.join(UPLOAD_DIR, file);
                    try {
                        await fs.unlink(filePath);
                        logger.info(`Deleted file: ${filePath}`);
                    } catch (err) {
                        logger.error(`Failed to delete file: ${filePath}`, err);
                    }
                }
            }

            logger.info(`Job processed successfully: ${this.queueName}`);
        } catch (error) {
            logger.error(`Error processing job ${this.queueName}: `, error);
        }
    }
}
