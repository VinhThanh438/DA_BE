import { IPaginationInput } from "./common.interface";
import { Gender } from "@config/app.constant";

export interface ICreateEmployee {
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

    job_position?: ICreateJobPosition[];

    educations?: ICreateEducation[];
    employee_finances?: ICreateFinance[];
    addresses?: ICreateAddress[];
    emergency_contacts?: ICreateEmergencyContact[];
    employee_contracts?: ICreateEmployeeContract[];
    insurances?: ICreateInsurance[];
}

export interface ICreateEducation {
    id: number;
    education_level: string;
    training_level?: string;
    graduated_place: string;
    faculty?: string;
    major?: string;
    graduation_year?: number;
}

export interface ICreateJobPosition {
    id: number;
    organization_id?: number;
    position_id?: number;
    level?: string;
    name: string;
    code?: string;
    description?: string;
}

export type FinanceType = 'kt' | 'pc';

export interface ICreateFinance {
    id: number;
    name: string;
    amount: number;
    note?: string;
    status: string;
    type: FinanceType;
}

export type IdentityType = 'cccd' | 'hc';

export interface ICreateIdentity {
    id: number;
    code: string;
    issued_place?: string;
    issued_date?: Date;
    expired_date?: Date;
    type: IdentityType;
}

export type AddressType = 'tt' | 'ht';

export interface ICreateAddress {
    id: number;
    country?: string;
    province?: string;
    district?: string;
    ward?: string;
    details?: string;
    type?: AddressType;
}

export interface ICreateEmployeeContract {
    id: number;
    code: string;
    type?: string;
    start_date?: Date;
    end_date?: Date;
    status?: string;
}

export interface ICreateInsurance {
    id: number;
    is_participating?: boolean;
    percent?: number;
    insurance_number?: string;
    insurance_salary?: number;
    start_date?: Date;
}

export interface ICreateEmergencyContact {
    id: number;
    name: string;
    relationship: string;
    phone: string;
    address?: string;
}

export interface IQueryFilterEmployee extends IPaginationInput {
    isCreateUser?: boolean;
}
