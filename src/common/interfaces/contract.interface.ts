import { ContractStatus } from "@config/app.constant";
import { ICommonDetails } from "./common.interface";

export interface IContract {
    code: string;
    tax?: string;
    sign_date?: DateString;
    delivery_date?: DateString;
    contract_date?: DateString;
    contract_value?: string;
    files?: string[];
    status?: ContractStatus;

    employee_id?: number;
    partner_id?: number;
    organization_id?: number;
    order_id?: number;

    details: ICommonDetails[];
}