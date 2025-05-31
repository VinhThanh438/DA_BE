import { BankType } from '@config/app.constant';
import { IArrayDataInput } from './common.interface';

export interface IBank extends IArrayDataInput {
    id?: number;
    bank: string;
    account_number?: string;
    name: string;
    code?: string;
    balance?: number;
    partner_id: number | null;
    organization_id: number | null;
    type?: BankType;
    description?: string;
    branch?: string;
}
