import { TransactionOrderType, TransactionType } from '@config/app.constant';
import { IBank } from './bank.interface';
import { IOrder } from './order.interface';
import { IInvoice } from './invoice.interface';
import { IPayment } from './payment.interface';

export interface ITransaction {
    id?: number;
    time_at?: string;
    type?: TransactionType;
    order_type?: TransactionOrderType;
    amount?: number;
    note?: Date;

    partner_id?: number;
    employee_id?: number;
    organization_id?: number;
    order_id?: number;
    invoice_id?: number;
    bank_id?: number;

    payment_request_id?: number;
    payment_id?: number;

    // bank?: IBank;
    // order?: IOrder;
    // invoice?: IInvoice;
    // payment?: IPayment;
}
