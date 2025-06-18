import logger from '@common/logger';
import { DoneCallback, Job, Queue } from 'bull';
import { HANDLE_LOAN_PAYMENT_JOB as JOB_NAME } from '@config/job.constant';
import { QueueService } from '@common/services/queue.service';
import { IJobHandleLoanPayment } from '@common/interfaces/transaction.interface';
import { LoanService } from '@common/services/loan.service';

export class HandleInterestLogJob {
    private static loanService: LoanService;

    static async register(): Promise<Queue<unknown>> {
        logger.info(`Listening to queue: ${JOB_NAME}`);

        this.loanService = LoanService.getInstance();

        const queue = await QueueService.getQueue<any>(JOB_NAME);

        await queue.process(this.handler.bind(this));

        return queue;
    }

    public static async handler(job: Job<IJobHandleLoanPayment>, done: DoneCallback): Promise<void> {
        try {
            logger.debug(`Process job ${JOB_NAME}-${job.id} with data: `, job.data);

            await this.loanService.handleLoanPayment(job.data);

            logger.debug(`Processed job ${JOB_NAME}-${job.id}`);
            done();
        } catch (error) {
            logger.error(`Process ${JOB_NAME} error: `, error);
            done(error as Error);
        }
    }
}
