import { OrderType } from '@config/app.constant';
import { IOrderExpense } from './order-expense.interface';
import { IProduction } from './production.interface';
import { IContract } from './contract.interface';
import { IInvoice } from './invoice.interface';
import { ICommonDetails } from './common.interface';

export interface IOrder {
    id?: number;
    code?: string;
    type: OrderType;
    address?: string;
    phone?: string;
    note?: string;
    order_date?: Date;
    files?: string[];

    employee_id?: number;
    partner_id?: number;
    organization_id?: number;

    details?: ICommonDetails[]
    order_expenses?: IOrderExpense[];
    productions?: IProduction[];
    contracts?: IContract[];
    invoices?: IInvoice[];
}