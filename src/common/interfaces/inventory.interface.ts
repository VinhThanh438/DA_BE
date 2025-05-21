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
    license_plate?: string;

    customer_id?: number;
    employee_id?: number;
    supplier_id?: number;
    delivery_id?: number;
    organization_id?: number;
    order_id?: number;
    warehouse_id?: number;

    details: ICommonDetails[];
}

export interface IUpdateWarehouseTransaction {
    
}

export interface InventoryDetail {
    id?: number;
    product_id: number;
    unit_id: number;
    real_quantity: number;
    quantity?: number;
    price: number;
    discount?: number;
    vat?: number;
    note?: string;
    commission?: number;
    key?: string;
}