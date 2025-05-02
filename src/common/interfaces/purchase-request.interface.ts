import { PurchaseRequestStatus } from "@config/app.constant";

export interface IPurchaseRequest {
    id: number;
    code: string;
    status?: PurchaseRequestStatus;
    files?: string[];
    note?: string;

    employee_id?: number;
    production_id?: number;
    order_id?: number;
    organization_id?: number;

    details?: IPurchaseRequestDetail[];
}

export interface IPurchaseRequestDetail {
    id: number;
    quantity: number;
    note?: string;
    key?: string;

    purchase_request_id: number;
    product_id?: number;

    purchase_request?: IPurchaseRequest;
}
