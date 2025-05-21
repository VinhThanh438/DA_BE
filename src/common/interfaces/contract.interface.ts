import { ContractStatus, ContractType } from '@config/app.constant';
import { ICommonDetails, IUpdateChildAction } from './common.interface';

export interface IContract extends IUpdateChildAction {
    code: string;
    tax?: string;
    note?: string;
    time_at?: DateString;
    delivery_date?: DateString;
    contract_date?: DateString;
    contract_value?: number;
    files?: string[];
    status?: ContractStatus;
    type?: ContractType;

    employee_id?: number;
    partner_id?: number;
    organization_id?: number;
    order_id?: number;

    details: ICommonDetails[];
}
