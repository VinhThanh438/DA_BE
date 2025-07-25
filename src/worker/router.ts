import { IWorker } from '@worker/interface';
import { SendConfirmMailJob } from './jobs/send-confirm-mail.job';
import { SendPendingMailJob } from './jobs/send-pending-mail.job';
import { AddInterestLogsDailyJob } from './jobs/add-interest-log-daily.job';
import { HandleLoanPaymentJob } from './jobs/handle-loan-payment.job';
import { RejectQuotationMailJob } from './jobs/reject-quotation-mail.job';
import { CreateOrderFromQuotationJob } from './jobs/create-order-from-quotation.job';
import { DeleteFileDailyJob } from './jobs/delete-file-daily-job';
import { UpdateInvoiceDataJob } from './jobs/update-invoice-data.job';

export class Router {
    private static createOrderFromQuotationJob = CreateOrderFromQuotationJob.getInstance();
    private static sendConfirmMailJob = SendConfirmMailJob.getInstance();
    private static sendPendingMailJob = SendPendingMailJob.getInstance();
    private static addInterestLogsDailyJob = AddInterestLogsDailyJob.getInstance();
    private static handleLoanPaymentJob = HandleLoanPaymentJob.getInstance();
    private static rejectQuotationMailJob = RejectQuotationMailJob.getInstance();
    private static deleteFileDailyJob = DeleteFileDailyJob.getInstance();
    private static updateInvoiceDataJob = UpdateInvoiceDataJob.getInstance();

    static async register(): Promise<IWorker[]> {
        const workers: Promise<IWorker>[] = [
            this.createOrderFromQuotationJob.register(),
            this.addInterestLogsDailyJob.register(),
            this.deleteFileDailyJob.register(),
            this.handleLoanPaymentJob.register(),
            this.rejectQuotationMailJob.register(),
            this.sendConfirmMailJob.register(),
            this.sendPendingMailJob.register(),
            this.updateInvoiceDataJob.register(),
        ];

        return Promise.all(workers);
    }
}
