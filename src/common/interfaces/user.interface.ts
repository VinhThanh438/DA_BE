import { IUserRole } from "./role.interface";

export interface ICreateUser {
    username: string;
    password: string;
    email?: string;
    employee_id?: number;
    device_uid?: string[];
    user_roles?: IUserRole[];
}

export interface IEventUserFirstLoggin {
    id: number;
    device?: string;
    status: boolean;
}

export interface IUpdateEmployeeAccountStatus {
    employeeId: number;
    status: boolean;
}
