import { BankType } from '@config/app.constant';
import { IPaginationInput } from './common.interface';

export interface ICreateBank {
    bank: string;
    account_number?: string;
    name: string;
    partner_id?: number | null;
    [key: string]: any;}

export interface IUpdateBank extends ICreateBank {}
export interface IPaginationInputBank extends IPaginationInput {
    type?: BankType | '';
    id?: string;
}
