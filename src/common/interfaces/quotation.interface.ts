import { QuotationStatus, QuotationType } from "@config/app.constant";
import { ICommonDetails } from "./common.interface";

export interface IQuotation {
    partner_id?: number;
    code: string;
    time_at?: DateString | Date;
    note?: string;
    employee_id?: number;
    expired_date?: DateString | Date;
    type: QuotationType;
    status?: QuotationStatus;
    files?: string[];
    
    details: ICommonDetails[];
}