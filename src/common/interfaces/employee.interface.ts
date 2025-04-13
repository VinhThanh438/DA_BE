export interface ICreateEmployee {
    code?: string;
    email?: string;
    fullname?: string;
    age?: number;
    phone_number?: string;
    description?: string;
    avatar?: string;
    type: string;
    files?: any;

    // education_id?: number;
    // finance_id?: number;
    // identity_id?: number;
    // address_id?: number;
    // emergency_contact_id?: number;
    // contract_id?: number;
    // social_insurance_id?: number;
    // user_position_id?: number;

    education?: ICreateEducation;
    finance?: ICreateFinance;
    identity?: ICreateIdentity;
    address?: ICreateAddress;
    emergency_contact?: ICreateEmergencyContact;
    contract?: ICreateUserContract;
    social_insurance?: ICreateSocialInsurance;
    user_position?: ICreateUserPosition;
}

export interface ICreateEducation {
    education_level: string;
    training_level?: string;
    graduated_place: string;
    faculty?: string;
    major?: string;
    graduation_year?: number;
}

export type FinanceType = 'kt' | 'pc';

export interface ICreateFinance {
    name: string;
    amount: number;
    note?: string;
    status: string;
    type: FinanceType;
}


export type IdentityType = 'cccd' | 'hc';

export interface ICreateIdentity {
    code: string;
    issued_place?: string;
    issued_date?: Date;
    expired_date?: Date;
    type: IdentityType;
}

export type AddressType = 'tt' | 'qq' | 'tttv';

export interface ICreateAddress {
    country?: string;
    province?: string;
    district?: string;
    ward?: string;
    details?: string;
    type?: AddressType;
}

export interface ICreateUserContract {
    code: string;
    type?: string;
    start_date?: Date;
    end_date?: Date;
    status?: string;
}

export interface ICreateSocialInsurance {
    is_participating?: boolean;
    percent?: number;
    insurance_number?: string;
    insurance_salary?: number;
    start_date?: Date;
}

export interface ICreateUserPosition {
    time_keeping_code?: string;
    organization_id?: number;
    job_position_id?: number;
    working_status?: string;
    hr_status?: string;
    trial_date?: Date;
    official_date?: Date;
}

export interface ICreateEmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    address?: string;
}
