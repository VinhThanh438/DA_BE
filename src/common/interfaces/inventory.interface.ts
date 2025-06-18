import { ICommonDetails, IPaginationInput, IUpdateChildAction } from './common.interface';
import { InventoryType } from '@config/app.constant';

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

    customer_id?: number;
    employee_id?: number;
    supplier_id?: number;
    shipping_plan_id?: number;
    organization_id?: number;
    order_id?: number;
    warehouse_id?: number;

    details: InventoryDetail[]; // replace ICommonDetails -> InventoryDetail
    files_add?: string[];
    files_delete?: string[];
    add?: InventoryDetail[];
    update?: InventoryDetail[];
    delete?: number[];
}

export interface IUpdateWarehouseTransaction {}

export interface InventoryDetail {
    id?: number;
    order_detail_id: number;
    real_quantity: number;
    quantity?: number;
    note?: string;
    key?: string;
    order_detail?: ICommonDetails; // This can be replaced with a more specific type if needed
    // unit?: any
    // product?: any;
}

export interface IInventoryDifferent extends IInventory {
    total_different_quantity?: number;
    total_different_money?: number;
}
