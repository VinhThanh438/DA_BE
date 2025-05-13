import { FinanceRecordType } from "@config/app.constant";

export interface IFinanceRecord {
    id: number;
    code: string;
    time_at?: Date;
    description?: string;
    payment_method?: string;
    amount?: number;
    counterparty_name?: string;
    counterparty_address?: string;
    type: FinanceRecordType;
    attached_documents?: string;
    files: string[];

    partner_id?: number;
    employee_id?: number;
    organization_id?: number;
}
