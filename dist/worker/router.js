"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const send_confirm_mail_job_1 = require("./jobs/send-confirm-mail.job");
const send_pending_mail_job_1 = require("./jobs/send-pending-mail.job");
const add_interest_log_daily_job_1 = require("./jobs/add-interest-log-daily.job");
const handle_loan_payment_job_1 = require("./jobs/handle-loan-payment.job");
const reject_quotation_mail_job_1 = require("./jobs/reject-quotation-mail.job");
const create_order_from_quotation_job_1 = require("./jobs/create-order-from-quotation.job");
const delete_file_daily_job_1 = require("./jobs/delete-file-daily-job");
const update_invoice_data_job_1 = require("./jobs/update-invoice-data.job");
class Router {
    static register() {
        return __awaiter(this, void 0, void 0, function* () {
            const workers = [
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
        });
    }
}
exports.Router = Router;
Router.createOrderFromQuotationJob = create_order_from_quotation_job_1.CreateOrderFromQuotationJob.getInstance();
Router.sendConfirmMailJob = send_confirm_mail_job_1.SendConfirmMailJob.getInstance();
Router.sendPendingMailJob = send_pending_mail_job_1.SendPendingMailJob.getInstance();
Router.addInterestLogsDailyJob = add_interest_log_daily_job_1.AddInterestLogsDailyJob.getInstance();
Router.handleLoanPaymentJob = handle_loan_payment_job_1.HandleLoanPaymentJob.getInstance();
Router.rejectQuotationMailJob = reject_quotation_mail_job_1.RejectQuotationMailJob.getInstance();
Router.deleteFileDailyJob = delete_file_daily_job_1.DeleteFileDailyJob.getInstance();
Router.updateInvoiceDataJob = update_invoice_data_job_1.UpdateInvoiceDataJob.getInstance();
