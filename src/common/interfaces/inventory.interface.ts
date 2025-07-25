import { ICommonDetails, IPaginationInput, IUpdateChildAction } from './common.interface';
import { CommonApproveStatus, InventoryType } from '@config/app.constant';
import { IOrder } from './order.interface';
import { IOrganization } from './organization.interface';
import { IPartner } from './partner.interface';

export interface IPaginationInventory extends IPaginationInput {
    type?: String;
}

export interface IInventory extends IUpdateChildAction {
    code: string;
    type: InventoryType;
    note?: string;
    time_at?: Date;
    files?: string[];
    plate?: string;
    vehicle?: string;
    delivery_cost?: number;
    identity_code?: string;
    representative_name?: string;
    content?: string;
    vat?: number;

    customer_id?: number;
    employee_id?: number;
    supplier_id?: number;
    shipping_plan_id?: number;
    organization_id?: number;
    order_id?: number;
    warehouse_id?: number;
    delivery_id?: number;

    details: InventoryDetail[]; // replace ICommonDetails -> InventoryDetail
    files_add?: string[];
    files_delete?: string[];
    add?: InventoryDetail[];
    update?: InventoryDetail[];
    delete?: number[];
    order_detail?: ICommonDetails; // This can be replaced with a more specific type if needed
    order?: IOrder;
}

export interface IUpdateWarehouseTransaction {}

export interface InventoryDetail {
    id: number;
    order_detail_id: number;
    real_quantity: number;
    quantity_adjustment?: number; // This can be used to adjust the quantity if needed
    quantity?: number;
    kg?: number; // This can be used for weight-based inventory
    real_kg?: number; // This can be used for weight-based inventory
    note?: string;
    key?: string;
    product_id: number;
    order_detail?: ICommonDetails; // This can be replaced with a more specific type if needed
    price?: number; // This can be used to store the price of the product at the time of inventory
    // unit?: any
    // product?: any;
}

export interface IInventoryDifferent extends IInventory {
    total_different_quantity?: number;
    total_different_money?: number;
}

export interface IEventInventoryApproved {
    id: number;
    status: CommonApproveStatus;
}

export interface IInventoryPDF {
    representative_name: string;
    vehicle: string;
    plate: string;
    identity_code: string;
    organization: IOrganization;
    shipping_plan: {
        partner: IPartner;
    };
    details: InventoryDetail[];
}
