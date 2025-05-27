import { IBank } from './bank.interface';
import { IInvoice } from './invoice.interface';
import { IOrder } from './order.interface';

export interface IDebtResponse {
    beginning_debt?: number;
    debt_increase?: number;
    debt_reduction?: number;
    ending_debt?: number;
    details: IDebtDetail[];
}

export interface IDebtDetail {
    order?: Partial<IOrder> | null;
    invoice?: Partial<IInvoice> | null;
    reduction?: number | null;
    increase?: number | null;
    beginning?: number | null;
    ending: number;
    time_at: Date | null;
    bank: IBank | null;
    payment_requests?: any[];
}

export interface ICommissionDebtDetail extends IDebtDetail {
    total_commission: number;
    comission: number;
}

export interface ICommissionDebtResponse extends IDebtResponse {
    beginning_commssion_debt?: number;
    commission_debt_increase?: number;
    commission_debt_reduction?: number;
    ending_commission_debt?: number;
    details: ICommissionDebtDetail[];
}
