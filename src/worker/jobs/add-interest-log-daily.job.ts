import logger from '@common/logger';
import { DoneCallback, Job, Queue } from 'bull';
import { ADD_INTEREST_LOGS_DAILY_JOB as JOB_NAME } from '@config/job.constant';
import { QueueService } from '@common/services/queue.service';
import { DEFAULT_TIME_ZONE } from '@config/app.constant';
import { LoanService } from '@common/services/loan.service';

export class AddInterestLogsDailyJob {
    private static loanService: LoanService;

    static async register(): Promise<Queue<unknown>> {
        logger.info(`Listening to queue: ${JOB_NAME}`);

        this.loanService = LoanService.getInstance();

        const queue = await QueueService.getQueue<unknown>(JOB_NAME);

        const jobOpts = {
            repeat: {
                // cron: '* * * * *', // moi phut
                cron: '1 0 0 * * *', // 0 a.m mỗi ngày/
                tz: DEFAULT_TIME_ZONE,
            },
        };

        await queue.clean(5000, 'delayed');
        await queue.add({ job: JOB_NAME }, jobOpts);
        await queue.process(this.handler.bind(this));

        return queue;
    }

    static async handler(job: Job, done: DoneCallback): Promise<void> {
        try {
            logger.debug(`Process job ${JOB_NAME}-${job.id}`);
            await this.loanService.autoCreateInterestLogsEverySingleDay();
            logger.debug(`Processed job ${JOB_NAME}-${job.id}`);
            done();
        } catch (error) {
            logger.error(`Process ${JOB_NAME}-${job.id} error: `, error);
            done(error as Error);
        }
    }
}
