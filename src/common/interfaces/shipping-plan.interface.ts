import { IOrder } from './order.interface';

export interface IShippingPlan {
    id?: number;
    price?: number;
    vat?: number;
    quantity?: number;
    completed_quantity?: number;
    status?: string;
    note?: string;
    facility_type?: string;

    total_money?: number;

    partner_id?: number;
    order_id?: number;

    order?: IOrder;

    created_at?: Date;
    updated_at?: Date;
    key?: string;
    files?: string[];

    files_add?: string[];
    files_delete?: string[];
}
