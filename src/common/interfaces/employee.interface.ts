import { Gender } from '@config/app.constant';
import { IOrganization } from './company.interface';

export interface IEmployee {
    code?: string;
    name?: string | null;
    avatar?: string | null;
    date_of_birth?: Date | null;
    gender: Gender;
    marital_status?: string | null;
    ethnicity?: string | null;
    religion?: string | null;
    tax?: string | null;
    description?: string | null;
    base_salary?: any;
    bank?: string;
    bank_code?: string;
    bank_branch?: string;

    phone?: string;
    email?: string;
    attendance_code?: string;
    working_status?: string;
    employee_status?: string;

    has_user_account?: boolean;

    identity_code?: string;
    identity_issued_place?: string;
    identity_issued_date?: Date;
    identity_expired_date?: Date;
    indentity_files?: string[];

    passport_code?: string;
    passport_issued_place?: string;
    passport_issued_date?: Date;
    passport_expired_date?: Date;
    passport_files?: string[];

    organization_id?: number;
    job_position_id?: number;

    trial_date?: Date;
    official_date?: Date;

    job_position?: IJobPosition[];

    educations?: IEducation[];
    employee_finances?: IEmployeeFinance[];
    addresses?: IAddress[];
    emergency_contacts?: IEmergencyContact[];
    employee_contracts?: IEmployeeContract[];
    insurances?: IInsurance[];
    organization?: IOrganization;
}

export interface IEducation {
    id: number;
    education_level: string;
    training_level?: string;
    graduated_place: string;
    faculty?: string;
    major?: string;
    graduation_year?: number;
}

export interface IJobPosition {
    id: number;
    organization_id?: number;
    position_id?: number;
    level?: string;
    name: string;
    code?: string;
    description?: string;
}

export type FinanceType = 'kt' | 'pc';

export interface IEmployeeFinance {
    id: number;
    name: string;
    amount: number;
    note?: string;
    status: string;
    type: FinanceType;
}

export type IdentityType = 'cccd' | 'hc';

export interface IIdentity {
    id: number;
    code: string;
    issued_place?: string;
    issued_date?: Date;
    expired_date?: Date;
    type: IdentityType;
}

export type AddressType = 'tt' | 'ht';

export interface IAddress {
    id: number;
    country?: string;
    province?: string;
    district?: string;
    ward?: string;
    details?: string;
    type?: AddressType;
}

export interface IEmployeeContract {
    id: number;
    code: string;
    type?: string;
    start_date?: Date;
    end_date?: Date;
    status?: string;
    file?: string;
}

export interface IInsurance {
    id: number;
    is_participating?: boolean;
    percent?: number;
    insurance_number?: string;
    insurance_salary?: number;
    start_date?: Date;
}

export interface IEmergencyContact {
    id: number;
    name: string;
    relationship: string;
    phone: string;
    address?: string;
}

export interface IUpdateEmployee extends IEmployee {
    employee_finances_add: IEmployeeFinance[];
    employee_finances_update: IEmployeeFinance[];
    employee_finances_delete: number[];

    employee_contracts_delete: number[];
    employee_contracts_update: IEmployeeContract[];
    employee_contracts_add: IEmployeeContract[];
}
