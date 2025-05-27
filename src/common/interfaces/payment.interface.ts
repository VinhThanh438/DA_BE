import { PaymentRequestStatus, PaymentRequestType, PaymentType } from '@config/app.constant';
import { IPaymentRequest } from './payment-request.interface';
import { IOrder } from './order.interface';
import { IInvoice } from './invoice.interface';
import { IPartner } from './partner.interface';
import { IBank } from './bank.interface';

export interface IPayment {
    id?: number;
    code?: string;
    status: PaymentRequestStatus;
    type: PaymentRequestType;
    rejected_reason?: string;
    note?: string;
    time_at?: Date;
    payment_date?: Date;
    files?: string[];
    files_add?: string[];
    files_delete?: string[];

    payment_request_id?: number;
    order_id?: number;
    invoice_id?: number;
    bank_id?: number;
    partner_id?: number;

    order?: IOrder;
    invoice?: IInvoice;
    partner?: IPartner;
    payment_request?: IPaymentRequest;
    bank?: IBank;

    description?: string;
    payment_method?: string;
    amount?: number;
    counterparty?: string;
    payment_type?: PaymentType;
    attached_documents?: string;
}
