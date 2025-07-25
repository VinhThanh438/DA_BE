import { PaymentRequestStatus, PaymentRequestType, PaymentType } from '@config/app.constant';
import { IPaymentRequest, IPaymentRequestDetail } from './payment-request.interface';
import { IOrder } from './order.interface';
import { IInvoice } from './invoice.interface';
import { IPartner } from './partner.interface';
import { IBank } from './bank.interface';
import { IOrganization } from './organization.interface';
import { IReport } from './report.interface';
import { IInterestLog } from './loan.interface';

export interface IPayment {
    id?: number;
    code?: string;
    status: PaymentRequestStatus;
    type: PaymentRequestType | PaymentType;
    rejected_reason?: string;
    note?: string;
    category?: string;
    time_at?: Date;
    payment_date?: Date;
    files?: string[];
    files_add?: string[];
    files_delete?: string[];

    payment_request_detail_id?: number;
    order_id?: number;
    invoice_id?: number;
    bank_id?: number;
    partner_id?: number;
    organization_id?: number;
    interest_log_id?: number;
    loan_id?: number;

    order?: IOrder;
    invoice?: IInvoice;
    partner?: IPartner;
    bank?: IBank;
    organization?: IOrganization;
    interest_log?: IInterestLog;
    payment_request_detail?: IPaymentRequestDetail;

    description?: string;
    payment_method?: string;
    amount?: number;
    counterparty?: string;
    payment_type?: PaymentType;
    attached_documents?: string;
}

export interface IFundBalanceReport extends IReport {
    bank?: IBank;
}

export interface IPaymentLedgerDetail extends IReport {
    time_at?: Date;
    content?: string;
}

export interface IPaymentLedger extends IReport {
    bank?: IBank;
    details: IPaymentLedgerDetail[];
}
