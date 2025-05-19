import { OrderStatus, OrderType } from '@config/app.constant';
import { IOrderExpense } from './order-expense.interface';
import { IProduction } from './production.interface';
import { IContract } from './contract.interface';
import { IInvoice } from './invoice.interface';
import { ICommonDetails } from './common.interface';
import { IInventory } from './inventory.interface';

export interface IOrder {
    id?: number;
    code?: string;
    type: OrderType;
    address?: string;
    phone?: string;
    note?: string;
    time_at?: Date;
    files?: string[];
    files_add?: string[];
    files_delete?: string[];

    employee_id?: number;
    partner_id?: number;
    representative_id?: number;
    organization_id?: number;
    bank_id?: number;

    details?: ICommonDetails[];
    order_expenses?: IOrderExpense[];
    productions?: IProduction[];
    contracts?: IContract[];
    invoices?: IInvoice[];
    inventories: IInventory[];

    add?: ICommonDetails[];
    update?: ICommonDetails[];
    delete?: number[];
}

export interface IApproveRequest {
    status: OrderStatus;
    type: OrderType;
    rejected_reason?: string;
}
