import eventbus from '@common/eventbus';
import { IEventInvoiceCreated } from '@common/interfaces/invoice.interface';
import {
    IEventInterestLogPaymented,
    IJobHandleLoanPayment,
    IPaymentCreatedEvent,
} from '@common/interfaces/transaction.interface';
import logger from '@common/logger';
import { LoanService } from '@common/services/loan.service';
import { QueueService } from '@common/services/queue.service';
import {
    EVENT_INTEREST_LOG_PAID,
    EVENT_INVOICE_CREATED,
    EVENT_LOAN_PAID,
    EVENT_PAYMENT_CREATED,
} from '@config/event.constant';
import { HANDLE_LOAN_PAYMENT_JOB } from '@config/job.constant';

export class LoanEvent {
    private static loanService: LoanService;

    /**
     * Register Loan event
     */
    static register(): void {
        this.loanService = LoanService.getInstance();

        eventbus.on(EVENT_PAYMENT_CREATED, this.paymentCreatedHandler.bind(this));
        eventbus.on(EVENT_INVOICE_CREATED, this.invoiceCreatedHandler.bind(this));
        eventbus.on(EVENT_INTEREST_LOG_PAID, this.interestLogPaidHandler.bind(this));
        eventbus.on(EVENT_LOAN_PAID, this.loanPaidHandler.bind(this));
    }

    private static async paymentCreatedHandler(data: IPaymentCreatedEvent): Promise<void> {
        try {
            const { payment_request_detail_id } = data;
            if (payment_request_detail_id) {
                await (await QueueService.getQueue<IJobHandleLoanPayment>(HANDLE_LOAN_PAYMENT_JOB)).add(data);
            } else {
                logger.warn('LoanEvent.paymentCreatedHandler: No payment request details found.');
            }
        } catch (error: any) {
            logger.error('LoanEvent.paymentCreatedHandler:', error);
        }
    }

    private static async invoiceCreatedHandler(data: IEventInvoiceCreated): Promise<void> {
        try {
            const orderId = data.orderId;
            const invoiceId = data.invoiceId;

            await this.loanService.addInvoiceInfo(orderId, invoiceId);

            logger.warn('LoanEvent.handler: loan updated successfully.');
        } catch (error: any) {
            logger.error('LoanEvent.handler:', error);
        }
    }

    private static async interestLogPaidHandler(data: IEventInterestLogPaymented): Promise<void> {
        try {
            await this.loanService.updateInterestLogStatus(data.interestLogId, data.isPaymented);
        } catch (error: any) {
            logger.error('LoanEvent.interestLogPaidHandler:', error);
        }
    }

    private static async loanPaidHandler(data: IPaymentCreatedEvent): Promise<void> {
        try {
            const { loan_id, amount, ...rest } = data;
            await this.loanService.processLoanPayment({
                loan_id: Number(data.loan_id),
                amount: Number(data.amount),
                paymentData: rest,
            });
        } catch (error: any) {
            logger.error('LoanEvent.loanPaidHandler:', error);
        }
    }
}
