export interface IQuotationRequestDetailRequest {
    product_id: number
    unit_id: number
    quantity: number
    note?: string;
    quotation_request_id?: number;
    key?: string;
    id?: number;
}
