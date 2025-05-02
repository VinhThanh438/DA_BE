export interface ICreateUser {
    username: string;
    password: string;
    email?: string;
    employee_id?: number;
    device_uid?: string[];
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
