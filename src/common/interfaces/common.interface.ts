import { RequestStatus } from '@config/app.constant';

export interface IPaginationInfo {
    totalPages: number;
    totalRecords: number;
    size: number;
    currentPage: number;
}

export interface IPaginationResponse<T = any> {
    data: T;
    pagination: IPaginationInfo;
}

export interface IFilterArgs {
    id?: number[];
    startAt?: DateString;
    endAt?: DateString;
    keyword?: string;
    [key: string]: any;
}

export interface IPaginationInput {
    page?: number;
    limit?: number;
    args?: IFilterArgs;
    startAt?: DateString;
    endAt?: DateString;
    keyword?: string;
    [key: string]: any;
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
    product_id: number;
    quantity: number;
    discount?: number;
    price: number;
    vat?: number;
    note?: string;
    key?: string;
}
