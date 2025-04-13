import { StringValue } from 'ms';

export enum PublicPath {
    PUBLIC_IMAGES = '/public/images',
}

export enum Language {
    VN = 'vi',
    EN = 'en',
}

export const ACCESS_TOKEN_EXPIRED_TIME: StringValue = '120s';
export const REFRESH_TOKEN_EXPIRED_TIME: StringValue = '20d';

export enum RequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
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

export interface MailOptions {
    to: string | string[];
    subject: string;
    template?: string;
    text?: string;
    from?: string;
    data?: any;
}
