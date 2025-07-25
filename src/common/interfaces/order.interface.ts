import { OrderStatus, OrderType, PrsOrderType } from '@config/app.constant';
import { IProduction } from './production.interface';
import { IContract } from './contract.interface';
import { IInvoice } from './invoice.interface';
import { ICommonDetails, IPaginationInput } from './common.interface';
import { IInventory } from './inventory.interface';
import { IShippingPlan } from './shipping-plan.interface';
import { IUnloadingCost } from './unloading-cost.interface';

export interface IOrder {
    id?: number;
    code?: string;
    type: OrderType | PrsOrderType; // Support both for compatibility
    address?: string;
    payment_method?: string;
    phone?: string;
    note?: string;
    time_at?: Date;
    files?: string[];
    files_add?: string[];
    files_delete?: string[];

    product_quality?: string;
    delivery_location?: string;
    delivery_method?: string;
    delivery_time?: string | undefined; // Fix: Use lowercase 'string' not 'String'
    payment_note?: string;
    additional_note?: string;
    detail_note?: string;

    employee_id?: number;
    partner_id?: number;
    representative_id?: number;
    organization_id?: number;
    shipping_plan_id?: number;
    bank_id?: number;
    delivery_progress?: number;

    details?: ICommonDetails[];
    productions?: IProduction[];
    contracts?: IContract[];
    invoices?: IInvoice[];
    inventories?: IInventory[];

    shipping_plans?: IShippingPlan[];
    shipping_plans_add?: IShippingPlan[];
    shipping_plans_update?: IShippingPlan[];
    shipping_plans_delete?: number[];

    unloading_costs?: IUnloadingCost[];
    unloading_costs_add?: IUnloadingCost[];
    unloading_costs_update?: IUnloadingCost[];
    unloading_costs_delete?: number[];

    add?: ICommonDetails[];
    update?: ICommonDetails[];
    delete?: number[];

    status?: OrderStatus;
    rejected_reason?: string;
    tolerance?: number;
    isDone?: boolean;
}

export interface IOrderPaginationInput extends IPaginationInput {
    isDone?: boolean;
}

export interface IOrderDetailPurchaseProcessing extends ICommonDetails {
    order_id?: number;
}
