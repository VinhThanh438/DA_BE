export interface IShippingPlan {
    id?: number;
    price?: number;
    quantity?: number;
    status?: string;
    note?: string;

    partner_id?: number;
    order_id?: number;

    created_at?: Date;
    updated_at?: Date;
    key?: string;
    files?: string[];

    files_add?: string[];
    files_delete?: string[];
}
