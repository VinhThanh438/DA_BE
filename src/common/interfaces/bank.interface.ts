import { BankType } from '@config/app.constant';
import { IArrayDataInput } from './common.interface';
import { transferSchema } from '@api/validation/bank.validator';
import { ITransaction } from './transaction.interface';
import z from 'zod';

export interface IBank extends IArrayDataInput {
    id?: number;
    bank: string;
    account_number?: string;
    name: string;
    code?: string;
    balance?: number;
    partner_id: number | null;
    organization_id: number | null;
    employee_id: number | null;
    representative_id: number | null;

    type?: BankType;
    description?: string;

    branch?: string;
}

export type IBankTransfer = z.infer<typeof transferSchema>;

export interface IFundBalance extends IBank {
    transactions: ITransaction[];
}
