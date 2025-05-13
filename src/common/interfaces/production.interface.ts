export interface IProduction {
    code?: string;
    time_at?: DateString;
    files?: string[];

    organization_id?: number;
    order_id?: number;
    partner_id?: number;
    employee_id?: number;

    details: {
        product_id: number;
        unit_id?: number;
        quantity: number;
        completion_date?: DateString;
        note?: string;
    }[];
}
