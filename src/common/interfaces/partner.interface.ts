import { PartnerType } from '@config/app.constant';
import { IBank } from './bank.interface';
import { IArrayDataInput } from './common.interface';

export interface IRepresentative extends IArrayDataInput {
    id?: number;
    phone?: string;
    salutation?: string;
    title?: string;
    email?: string;

    bank_id?: number;
    partner_id?: number;

    banks?: IBank;
}

export interface IPartner {
    id?: number;
    code?: string;
    name: string;
    phone?: string;
    note?: string;
    tax?: string;
    address?: string;
    representative_position?: string;
    representative_name?: string;
    representative_email?: string;
    representative_phone?: string;
    type?: PartnerType;

    employee_id?: number;
    partner_group_id?: number;
    clause_id?: number;

    representatives?: IRepresentative[];
}