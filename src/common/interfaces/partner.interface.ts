import { PartnerType } from '@config/app.constant';
import { IPaginationInput } from './common.interface';
import { ICreateBank } from './bank.interface';

export interface IUpdateOrCreatePartner {
    code?: string;
    name: string;
    phone?: string | null;
    note?: string | null;
    tax?: string | null;
    type?: PartnerType;
    sale_staff_id?: number | null;
    partner_group_id?: number | null;
    emergency_contact_id?: number | null;
    payment_term?: string | null;
    representatives: {
        representative_name?: string;
        representative_phone?: string;
        representative_title?: string;
        representative_email?: string;
    }[];
    addresses: {
        address_type: string;
        address_name: string;
    }[];
}
export interface ICreatePartner extends IUpdateOrCreatePartner {
    type: PartnerType;
    product_group_id: number | null;
    clause_id: number | null;
    bank_accounts: {
        account_number?: string;
        name: string;
        partner_id?: number | null;
        key?: string;
    }[];
}
export interface IUpdatePartner extends IUpdateOrCreatePartner {
    bank_accounts: {
        add: {
            account_number?: string;
            name: string;
            partner_id?: number | null;
            key?: string;
        }[];
        update: {
            bank_id?: number;
            account_number?: string;
            name: string;
            partner_id?: number | null;
            key?: string;
        }[];
        delete: {
            id: number;
            key?: string;
        }[];
    };
}
export interface IPaginationInputPartner extends IPaginationInput {
    type?: PartnerType | '';
    organization_id?: number | null;
}
export interface IPaginationInputPartnerGroup extends IPaginationInputPartner {}
