import { InvoiceStatus } from '@config/app.constant';
import { ICommonDetails, IUpdateChildAction } from './common.interface';

export interface IInvoice extends IUpdateChildAction {
    code: string;
    payment_method?: string;
    time_at?: DateString;
    files?: string[];
    status?: InvoiceStatus;

    bank_id: number;
    employee_id: number;
    partner_id: number;
    organization_id: number;
    contract_id: number;
    order_id?: number;

    details: ICommonDetails[];
}
