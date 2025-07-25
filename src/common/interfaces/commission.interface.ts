export interface ICommission {
    id?: number;
    key?: string;
    price: number;
    price_vat?: number;
    quantity?: number;
    quantity_vat?: number;

    note?: string;
    total_quantity: number;
    origin_price: number;

    representative_id: number;
    order_detail_id?: number;
    quotation_request_detail_id?: number;
    facility_order_id?: string;
}
