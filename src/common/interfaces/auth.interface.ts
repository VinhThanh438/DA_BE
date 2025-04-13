export interface ILoginRequest {
    username: string;
    password: string;
    ua?: string;
    ip?: string;
    device?: string;
}

export interface IPayload {
    id: number;
}

export interface ILoginResponse {
    access_token: string;
    refresh_token: string;
}

export interface IAuthEvent {
    id: number;
    refreshToken: string;
    accessToken: string;
}

export interface ICreateToken {
    userId: number;
    refreshToken: string;
    ua?: string;
    ip?: string;
}

export interface ICreateDeviceRequest extends ILoginRequest {
    userId: number;
}
