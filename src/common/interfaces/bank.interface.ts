import { IArrayDataInput } from './common.interface';

export interface IBank extends IArrayDataInput {
    id?: number;
    bank: string;
    account_number?: string;
    name: string;
    partner_id: number | null;
    organization_id: number | null;
}
