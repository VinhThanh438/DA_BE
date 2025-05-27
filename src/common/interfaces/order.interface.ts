import { OrderStatus, OrderType } from '@config/app.constant';
import { IOrderExpense } from './order-expense.interface';
import { IProduction } from './production.interface';
import { IContract } from './contract.interface';
import { IInvoice } from './invoice.interface';
import { ICommonDetails } from './common.interface';
import { IInventory } from './inventory.interface';
import { IShippingPlan } from './shipping-plan.interface';

export interface IOrder {
    id?: number;
    code?: string;
    type: OrderType;
    address?: string;
    payment_method?: string;
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
    delivery_progress?: number;

    details?: ICommonDetails[];
    order_expenses?: IOrderExpense[];
    productions?: IProduction[];
    contracts?: IContract[];
    invoices?: IInvoice[];
    inventories: IInventory[];
    shipping_plans?: IShippingPlan[];
    shipping_plans_add?: IShippingPlan[];
    shipping_plans_update?: IShippingPlan[];
    shipping_plans_delete?: number[];

    add?: ICommonDetails[];
    update?: ICommonDetails[];
    delete?: number[];

    status?: OrderStatus;
    rejected_reason?: string;
}
