import { PurchaseRequestStatus } from '@config/app.constant';

export interface IPurchaseRequest {
    id: number;
    code: string;
    status?: PurchaseRequestStatus;
    files?: string[];
    note?: string;
    rejected_reason?: string;
    time_at?: string;

    employee_id?: number;
    production_id?: number;
    order_id?: number;
    organization_id?: number;

    details?: IPurchaseRequestDetail[];

    add?: IPurchaseRequestDetail[];
    update?: IPurchaseRequestDetail[];
    delete?: number[];

    files_add?: string[];
    files_delete?: string[];
}

export interface IPurchaseRequestDetail {
    id: number;
    quantity: number;
    note?: string;
    key?: string;

    purchase_request_id: number;
    material_id?: number;
    unit_id?: number;

    purchase_request?: IPurchaseRequest;
}

export interface IApproveRequest {
    status: PurchaseRequestStatus;
    rejected_reason?: string;
}
