import { PaymentRequestStatus, PaymentRequestType } from '@config/app.constant';
import { IEmployee } from './employee.interface';
import { ICommonDetails } from './common.interface';

export interface IPaymentRequest {
    id?: number;
    code?: string;
    status: PaymentRequestStatus;
    type: PaymentRequestType;
    rejected_reason?: string;
    note?: string;
    time_at?: Date;
    payment_date?: Date;
    files?: string[];
    files_add?: string[];
    files_delete?: string[];

    employee_id?: number;
    employee?: IEmployee;
    details: ICommonDetails[];
}
