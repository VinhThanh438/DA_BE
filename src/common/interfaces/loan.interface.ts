import { Loans } from '.prisma/client';
import { IPartner } from './partner.interface';
import { IOrganization } from './organization.interface';
import { IInvoice } from './invoice.interface';
import { IBank } from './bank.interface';
import { z } from 'zod';
import { IOrder } from './order.interface';
import { getInterestLogs } from '@api/validation/interest-log.validator';

export interface ILoan extends Partial<Loans> {
    partner?: IPartner;
    organization?: IOrganization;
    invoice?: IInvoice;
    order?: IOrder;
    interest_logs?: IInterestLog[];
    bank?: IBank;

    add?: IInterestLog[];
    update?: IInterestLog[];
    delete?: number[];
}

export interface IInterestLog {
    id?: number;
    debt_before_payment?: number;
    time_at?: Date | string;
    amount?: number;
    interest_amount?: number;
    interest_days?: number;
    interest_rate?: number;
    is_paymented?: boolean;
    key?: string;

    loan_id?: number;
    organization_id?: number;

    loan?: any;
    organization?: any;
}

export type IGetInterestLogsRequest = z.infer<typeof getInterestLogs>;
export interface IEventLoanCreated extends ILoan {}
