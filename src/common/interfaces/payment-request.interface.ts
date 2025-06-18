import { PaymentRequestDetailStatus, PaymentRequestStatus, PaymentRequestType } from '@config/app.constant';
import { IEmployee } from './employee.interface';
import { IOrder } from './order.interface';
import { IInvoice } from './invoice.interface';

export interface IPaymentRequest {
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

    employee_id?: number;
    approver_id?: number;
    partner_id?: number;
    bank_id?: number;
    representative_id?: number;

    employee?: IEmployee;
    approver?: IEmployee;

    details: IPaymentRequestDetail[];
}

export interface IPaymentRequestDetail {
    id?: number;
    amount: number;
    note?: string;
    status?: PaymentRequestDetailStatus;

    order_id?: number;
    invoice_id?: number;
    interest_log_id?: number;
    loan_id?: number;

    order?: IOrder;
    invoice?: IInvoice;
    key?: string;
}
