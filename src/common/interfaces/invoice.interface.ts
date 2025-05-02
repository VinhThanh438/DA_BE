import { InvoiceStatus } from '@config/app.constant';
import { ICommonDetails } from './common.interface';

export interface IInvoice {
    code: string;
    payment_method?: string;
    invoice_date?: DateString;
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
