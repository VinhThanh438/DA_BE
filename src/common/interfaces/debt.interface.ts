import { IInvoice } from './invoice.interface';
import { IOrder } from './order.interface';
import { ITransaction } from './transaction.interface';

export interface IDebtResponse {
    beginning_debt?: number;
    debt_increase?: number;
    debt_reduction?: number;
    ending_debt?: number;
    details: IDebtDetail[];
}

export interface IDebtDetail {
    invoice?: IInvoice;
    order?: IOrder;
    beginning_debt?: number | null;
    ending_debt: number;
    transactions: ITransaction[];
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
