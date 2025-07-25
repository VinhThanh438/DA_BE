import { QuotationStatus, QuotationRequestType } from "@config/app.constant";
import { IPaginationInput } from "./common.interface";
import { IQuotationRequestDetailRequest } from "./quotation-request-detail.interface";

export interface IQuotationRequest {
    organization_name: string;
    requester_name: string;
    receiver_name?: string;
    tax?: string;
    code?: string;
    phone?: string;
    email?: string;
    address?: string;
    note?: string;
    files?: string[];
    status?: QuotationStatus;
    details: IQuotationRequestDetailRequest[];
    add?: IQuotationRequestDetailRequest[]
    update?: IQuotationRequestDetailRequest[]
    delete?: number[]
    files_add?: string[]
    files_delete?: string[]
    representative_id?: number;
    time_at?: Date;
    partner_id?: number;
}

export interface IPaginateQuotationRequest extends IPaginationInput {
    type: QuotationRequestType;
}