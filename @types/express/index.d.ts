import { IRequestInfo } from '@common/request.interface';

declare global {
    namespace Express {
        interface Request {
            t: (key: string, options?: any) => string;
            user: any;
            getRequestInfo(): IRequestInfo;
            userDevice: IRequestInfo;
            userTimezone: string;
        }

        interface Response {
            t: (key: string, options?: any) => string;
            sendJson(data?: unknown): this;
            secureCookie: (name: string, value: string, options?: import('express').CookieOptions) => void;
        }
    }
}

export {};
