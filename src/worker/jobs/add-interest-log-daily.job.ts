import { Job } from 'bullmq';
import logger from '@common/logger';
import { QueueService } from '@common/services/queue.service';
import { LoanService } from '@common/services/loan.service';
import { BaseJob } from './base.job';
import { ADD_INTEREST_LOGS_DAILY_JOB as JOB_NAME } from '@config/job.constant';
import { DEFAULT_TIME_ZONE } from '@config/app.constant';

export class AddInterestLogsDailyJob extends BaseJob {
    public readonly queueName = JOB_NAME;
    private loanService: LoanService;

    private constructor() {
        super();
        this.loanService = LoanService.getInstance();
    }

    public static getInstance(): AddInterestLogsDailyJob {
        return new AddInterestLogsDailyJob();
    }

    public async register(): Promise<this> {
        await super.register();

        const queue = await QueueService.getQueue(this.queueName);

        const jobOpts = {
            jobId: JOB_NAME,
            repeat: {
                // cron: '* * * * *', // Mỗi phút
                cron: '1 0 0 * * *', // 0:00:01 AM mỗi ngày
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
            await this.loanService.autoCreateInterestLogsEverySingleDay();
            logger.info(`Job processed successfully: ${this.queueName}`);
        } catch (error) {
            logger.error(`Error processing job ${this.queueName}: `, error);
        }
    }
}
