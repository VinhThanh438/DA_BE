import { DebtType, PartnerType } from '@config/app.constant';
import { IInvoice } from './invoice.interface';
import { IOrder } from './order.interface';
import { IShippingPlan } from './shipping-plan.interface';
import { ITransaction } from './transaction.interface';

export interface IDebt {
    id?: number;
    partner_id: number;
    invoice_id: number;
    order_id?: number;
    time_at?: Date;
    type: PartnerType;
    debt_type: DebtType;
    total_amount: number;
    total_commission?: number;
}

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
    shipping_plan?: IShippingPlan;
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
