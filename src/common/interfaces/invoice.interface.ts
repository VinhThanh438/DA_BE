import { InvoiceStatus } from '@config/app.constant';
import { ICommonDetails, IUpdateChildAction } from './common.interface';
import { IBank } from './bank.interface';
import { IContract } from './contract.interface';
import { IEmployee } from './employee.interface';
import { IOrder } from './order.interface';
import { IPartner } from './partner.interface';
import { ICreateOrganization } from './company.interface';

export interface IInvoice extends IUpdateChildAction {
    id?: number;
    code: string;
    time_at?: DateString;
    invoice_date?: DateString;
    files?: string[];
    status?: InvoiceStatus;

    bank_id: number;
    employee_id: number;
    partner_id: number;
    organization_id: number;
    contract_id: number;
    order_id?: number;

    bank?: IBank;
    employee?: IEmployee;
    partner?: IPartner;
    contract?: IContract;
    order?: IOrder;
    organization?: ICreateOrganization;

    details: IInvoiceDetail[];
}

export interface IInvoiceDetail {
    id?: number;
    invoice_id: number;
    order_detail_id: number;

    invoice?: IInvoice;
    order_detail?: ICommonDetails;
}

export interface IApproveRequest {
    status: InvoiceStatus;
    rejected_reason?: string;
}
