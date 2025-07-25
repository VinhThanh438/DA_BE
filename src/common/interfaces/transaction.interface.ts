import { PaymentType, TransactionOrderType, TransactionType } from '@config/app.constant';

export interface ITransaction {
    id?: number;
    time_at?: string | Date;
    payment_date?: string | Date;
    type?: TransactionType;
    order_type?: TransactionOrderType;
    amount?: number;
    description?: string;
    is_closed?: boolean;
    note?: string;

    partner_id?: number;
    employee_id?: number;
    organization_id?: number;
    order_id?: number;
    invoice_id?: number;
    bank_id?: number;
    loan_id?: number;

    payment_request_id?: number;
    interest_log_id?: number;
    payment_request_detail_id?: number;
    payment_id?: number;

    bank?: any;
    order?: any;
    invoice?: any;
    organization?: any;
    partner?: any;
    payment?: any;
    // order?: IOrder;
    // invoice?: IInvoice;
    // payment?: IPayment;
}

export interface IPaymentCreatedEvent extends ITransaction {
    new_bank_balance?: number;
    organization?: any;
}

export interface IJobHandleLoanPayment extends IPaymentCreatedEvent {}

export interface IPaymentDeletedEvent {
    bank_id?: number;
    refund?: number;
    type?: PaymentType;
}

export interface IEventInterestLogPaymented {
    interestLogId: number;
    isPaymented: boolean;
}
