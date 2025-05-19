import { QuotationStatus, QuotationType } from "@config/app.constant";
import { ICommonDetails, IPaginationInput, IUpdateChildAction } from "./common.interface";
import { IEmployee } from "./employee.interface";

export interface IQuotation extends IUpdateChildAction {
    partner_id?: number;
    code: string;
    time_at?: Date;
    note?: string;
    rejected_reason?: string;
    employee_id?: number;
    expired_date?: Date;
    type: QuotationType;
    status?: QuotationStatus;
    files?: string[];

    details: ICommonDetails[];
}

export interface ISupplierQuotationRequest {
    organization_name?: string;
    tax?: string;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    message?: string;
    files?: string[];
    quotation_files?: string[];
    type: QuotationType;

    purchase_request_id?: number;
    employee_id?: number;

    detail_ids: number[];

    employee: IEmployee;
}

export interface IApproveRequest {
    status: QuotationStatus,
    type: QuotationType,
    rejected_reason?: string,
}

export interface IQueryQuotation extends IPaginationInput {
    isMain: boolean;
}