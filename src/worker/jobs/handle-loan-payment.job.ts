import logger from '@common/logger';
import { HANDLE_LOAN_PAYMENT_JOB as JOB_NAME } from '@config/job.constant';
import { IJobHandleLoanPayment } from '@common/interfaces/transaction.interface';
import { LoanService } from '@common/services/loan.service';
import { Job } from 'bullmq';
import { BaseJob } from './base.job';

export class HandleLoanPaymentJob extends BaseJob<IJobHandleLoanPayment> {
    public readonly queueName = JOB_NAME;
    private readonly loanService: LoanService;

    constructor() {
        super();
        this.loanService = LoanService.getInstance();
    }

    public static getInstance(): HandleLoanPaymentJob {
        return new HandleLoanPaymentJob();
    }

    public async handler(job: Job<IJobHandleLoanPayment>): Promise<void> {
        try {
            logger.info(`Processing job: ${this.queueName}`);
            await this.loanService.handleLoanPayment(job.data);
            logger.info(`Job processed successfully: ${this.queueName}`);
        } catch (error) {
            logger.error(`Error processing job ${this.queueName}: `, error);
        }
    }
}
