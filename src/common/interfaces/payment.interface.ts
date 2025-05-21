import { PaymentRequestStatus, PaymentRequestType } from '@config/app.constant';
import { IPaymentRequest } from './payment-request.interface';
import { IOrder } from './order.interface';

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

    order?: IOrder;
    payment_request?: IPaymentRequest;
}
