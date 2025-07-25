import { ICommonDetails, IPaginationInput, IUpdateChildAction } from './common.interface';
import { QuotationStatus, QuotationType } from '@config/app.constant';
import { IEmployee } from './employee.interface';
import { IShippingPlan } from './shipping-plan.interface';
import { IFacilityOrder } from './facility-order.interface';

export interface IQuotation extends IUpdateChildAction {
    id: number;
    partner_id?: number;
    organization_id?: number;
    code: string;
    time_at?: Date;
    note?: string;
    rejected_reason?: string;
    employee_id?: number;
    expired_date?: string;
    type: QuotationType;
    status?: QuotationStatus;
    files?: string[];
    purchase_request_id?: number;
    product_quality?: string; // chất lượng hàng
    delivery_location?: string; // địa điểm giao hàng
    delivery_method?: string; // phương thức giao hàng
    delivery_time?: Date; // thời gian giao hàng
    payment_note?: string; // ghi chú thanh toán
    detail_notes?: string; // ghi chú chi tiết
    additional_note?: string; // ghi chú bổ sung

    details: ICommonDetails[];
    add?: ICommonDetails[];
    update?: ICommonDetails[];

    shipping_plans?: IShippingPlan[];
    shipping_plans_add?: IShippingPlan[];
    shipping_plans_update?: IShippingPlan[];
    shipping_plans_delete?: number[];

    facility_orders?: IFacilityOrder[];
    facility_order_add?: IFacilityOrder[];
    facility_order_update?: IFacilityOrder[];
    facility_order_delete?: number[];
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
    status: QuotationStatus;
    type: QuotationType;
    rejected_reason?: string;
}

export interface IQueryQuotation extends IPaginationInput {
    isMain: boolean;
}

export interface ICreateOrderFromQuotation {
    id: number;
}
