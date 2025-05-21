import { IBank } from "./bank.interface";
import { IInvoice } from "./invoice.interface";
import { IOrder } from "./order.interface";
import { IPaymentRequest } from "./payment-request.interface";

export interface IDebtResponse {
    beginning_debt?: number;
    debt_increase?: number;
    debt_reduction?: number;
    ending_debt?: number;
    details: IDebtDetail[];
}

export interface IDebtDetail {
    order: IOrder | null;
    invoice: IInvoice | null;
    total_amount: number;
    total_reduction: number;
    time_at: Date | null;
    amount: number | null;
    bank: IBank | null;
    payment_requests?: IPaymentRequest[];
}