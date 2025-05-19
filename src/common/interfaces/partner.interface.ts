import { PartnerType } from '@config/app.constant';
import { IBank } from './bank.interface';
import { IArrayDataInput, IUpdateChildAction } from './common.interface';
import { IPaginationInput } from './common.interface';

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

export interface IPartner extends IUpdateChildAction {
    id?: number;
    code?: string;
    name: string;
    email?: string;
    phone?: string;
    note?: string;
    tax?: string;
    address?: string;
    representative_position?: string;
    representative_name?: string;
    representative_email?: string;
    representative_phone?: string;
    type?: PartnerType;
    employee_id?: number | null;
    partner_group_id?: number | null;
    clause_id?: number;
    emergency_contact_id?: number | null;
    payment_term?: string | null;
    representatives: IRepresentative[];
    addresses: {
        address_type: string;
        address_name: string;
    }[];
}

export interface IPartnerDebtQueryFilter extends IPaginationInput {
    partnerId?: number;
}
