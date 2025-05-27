import { CommonApproveStatus, RequestStatus } from '@config/app.constant';

export interface IPaginationInfo {
    totalPages: number;
    totalRecords: number;
    size: number;
    currentPage: number;
}

export interface IPaginationResponse<T = any> {
    data: T | T[];
    pagination: IPaginationInfo;
}

export interface IArrayDataInput {
    [key: string]: any;
}

export interface IFilterArgs extends IArrayDataInput {
    id?: number[];
    startAt?: DateString;
    endAt?: DateString;
    keyword?: string;
    timeField?: string;
}

export interface IPaginationInput extends IArrayDataInput {
    page?: number;
    size?: number;
    args?: IFilterArgs;
    startAt?: DateString;
    endAt?: DateString;
    keyword?: string;
    organization_id?: any;
}

export interface ICreateAndUpdateResponse {
    id: number;
    userId: number;
}

export interface IIdResponse {
    id: number;
}

export interface SendMailData {
    email?: string;
    name?: string;
    from?: string;
}

export interface IJobSendConfirmEmailData extends SendMailData {
    status?: RequestStatus;
}

export type IJobSendPendingEmailData = SendMailData;

export interface ICommonDetails {
    id?: number;
    product_id: number;
    unit_id?: number;
    quantity: number;
    discount?: number;
    price: number;
    amount: number;
    vat?: number;
    commission?: number;
    note?: string;
    key?: string;
    imported_quantity?: number;

    order_id?: number;
    quotation_id?: number;
    contract_id?: number;
    invoice_id?: number;
    inventory_id?: number;
    warehouse_id?: number;
    order_detail_id?: number;
}

export interface IUpdateChildAction {
    add?: any[];
    update?: any[];
    delete?: number[];
}

export interface IApproveRequest {
    status: CommonApproveStatus;
    rejected_reason?: string;
    files?: string[];
}
