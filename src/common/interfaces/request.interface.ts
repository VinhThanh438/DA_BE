export interface IRequestInfo {
    ip?: string;
    ua?: string;
    device?: string;
}

export interface IBaseRequest {
    req_info: IRequestInfo;
}
