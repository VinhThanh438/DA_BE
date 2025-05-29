import { TransactionOrderType, TransactionType } from '@config/app.constant';

export interface ITransaction {
    id?: number;
    time_at?: string;
    type?: TransactionType;
    order_type?: TransactionOrderType;
    amount?: number;
    note?: string;

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

export interface IPaymentCreatedEvent extends ITransaction {
    new_bank_balance?: number;
}

export interface IPaymentDeletedEvent {
    bank_id?: number;
    refund?: number;
}
