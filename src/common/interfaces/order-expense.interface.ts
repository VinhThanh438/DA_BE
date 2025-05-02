import { OrderExpenseType } from "@config/app.constant";
import { IPaginationInput } from "./common.interface";

export interface IOrderExpense {
    id: number;
    code: string;
    time_at: DateString;
    description?: string;
    payment_method?: string;
    amount?: number;
    transaction_person?: string;
    address?: string;
    attached_documents?: string;
    type: OrderExpenseType;
    files?: string[];

    organization_id?: number | null;
    order_id?: number;
}

export interface IFilterOrderExpense extends IPaginationInput {
    type?: OrderExpenseType;
}