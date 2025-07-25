import { CommonApproveStatus, RequestStatus } from '@config/app.constant';
import { IProducts, IUnit } from './product.interface';
import { ICommission } from './commission.interface';

export interface IPaginationInfo {
    totalPages: number;
    totalRecords: number;
    size: number;
    currentPage: number;
}

export interface IPaginationResponse<T = any> {
    data: T | T[];
    pagination: IPaginationInfo;
    summary?: T;
    boms?: any[];
}

export interface IArrayDataInput {
    [key: string]: any;
}

export interface IFilterArgs extends IArrayDataInput {
    id?: number[];
    startAt?: DateString;
    endAt?: DateString;
    keyword?: string;
    status?: string;
    timeField?: string;
    productIds?: number[];
    supplierIds?: number[];
    warehouseIds?: number[];
    deliveryIds?: number[];
    customerIds?: number[];
    employeeIds?: number[];
    plate?: string;
    childrenIds?: number;
    unitId: number;
    isPublic?: boolean;
    type?: string;
    hasMesh?: boolean;
    warehouseId?: number;
}

export interface IPaginationInput extends IArrayDataInput {
    page?: number;
    size?: number;
    args?: IFilterArgs;
    startAt?: string;
    endAt?: string;
    keyword?: string;
    organizationId?: any;
}

export interface ICreateAndUpdateResponse {
    id: number;
    userId: number;
}

export interface IIdResponse {
    id: number;
}

export interface SendMailData {
    email?: string;
    name?: string;
    from?: string;
}

export interface IJobSendConfirmEmailData extends SendMailData {
    status?: RequestStatus;
}

export type IJobSendPendingEmailData = SendMailData;

export interface ICommonDetails {
    id?: number;
    product_id: number;
    unit_id?: number;
    quantity: number;
    discount?: number;
    price: number;
    amount: number;
    vat?: number;
    commission?: number;
    note?: string;
    key?: string;
    imported_quantity?: number;

    order_id?: number;
    quotation_id?: number;
    contract_id?: number;
    invoice_id?: number;
    inventory_id?: number;
    warehouse_id?: number;
    order_detail_id?: number;
    product?: IProducts;
    unit?: IUnit;

    material_id?: number; // vật tư chính
    current_price?: number; // giá bình quân hiện tại
    temp_cost?: number; // chi phí tạm
    real_quantity?: number; // số lượng thực tế
    real_price?: number; // giá thực tế

    quotation_request_detail_id?: number; // id của chi tiết yêu cầu báo giá

    commissions?: ICommission[]; // danh sách hoa hồng

    commissions_add?: ICommission[];
    commissions_update?: ICommission[];
    commissions_delete?: number[];
}

export interface IUpdateChildAction {
    add?: any[];
    update?: any[];
    delete?: number[];
    files_add?: string[];
    files_delete?: string[];
}

export interface IApproveRequest {
    status: CommonApproveStatus;
    rejected_reason?: string;
    files?: string[];
    is_save?: boolean;
    employee_id?: number;
}

export interface SearchField {
    path: string[];
    exactMatch?: boolean;
    isArray?: boolean;
}

export interface IJobSendRejectQuotationEmailData extends SendMailData {
    rejected_reason?: string;
    requester_name?: string;
    organization_name?: string;
    organization_phone?: string;
    organization_address?: string;
    organization_email?: string;
}

export interface IAddUpdateDelete<A, U> {
    add?: A[];
    update?: U[];
    delete?: number[];
    files_add?: string[];
    files_delete?: string[];
}
