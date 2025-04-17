import { RequestStatus } from '@config/app.constant';

export interface IPaginationInfo {
    total_pages: number;
    total_records: number;
    size: number;
    current_page: number;
}

export interface IPaginationResponse<T = any> {
    data: T;
    pagination: IPaginationInfo;
}

export interface IFilterArgs {
    id?: number[];
    startAt?: Date;
    endAt?: Date;
    keyword?: string;
}

export interface IPaginationInput {
    page?: number;
    limit?: number;
    args?: IFilterArgs;
    startAt?: string;
    endAt?: string;
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
