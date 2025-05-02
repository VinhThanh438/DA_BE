import { QuotationStatus, QuotationRequestType } from "@config/app.constant";
import { IPaginationInput } from "./common.interface";

export interface IQuotationRequest {
    organization_name: string;
    requester_name: string;
    receiver_name?: string;
    tax?: string;
    phone?: string;
    email?: string;
    address?: string;
    note?: string;
    files?: string[];
    type: QuotationRequestType;
    status?: QuotationStatus;
}

export interface IPaginateQuotationRequest extends IPaginationInput {
    type: QuotationRequestType;
}