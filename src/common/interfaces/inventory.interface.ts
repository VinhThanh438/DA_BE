import { InventoryType } from '@prisma/client'; // nếu enum này trong Prisma schema
import { IPaginationInput } from './common.interface';

export interface IPaginationInventory extends IPaginationInput {
    type?: String;
}

interface BaseInventory {
    code?: string;
    type?: InventoryType;
    order_id?: number;
}

export interface Inventory extends BaseInventory {
    code: string;
    type: InventoryType;
    note?: string; // Ghi chú đơn hàng
    files?: any; // JSON: mảng file (có thể là { name, path, ... })
    license_plate?: string; // Biển số xe vận chuyển
    customer_id?: number;
    employee_id?: number; // Nhân viên nhập kho
    supplier_id?: number;
    delivery_id?: number; // Đơn vị vận chuyển
    products?: InventoryInventoryDetails[];
    time_at?: Date;
    organization_id?: number; // Đơn vị mua hàng
}
export interface IUpdateInventory extends BaseInventory {
    type?: InventoryType;
    note?: string; // Ghi chú đơn hàng
    files?: string[];
    time_at?: Date;
    license_plate?: string; // Biển số xe vận chuyển
    customer_id?: number;
    employee_id?: number; // Nhân viên nhập kho
    supplier_id?: number;
    delivery_id?: number; // Đơn vị vận chuyển
    products?: IUpdateInventories;
    organization_id?: number; // Đơn vị mua hàng
}
export interface InventoryInventoryDetails {
    quantity: number; // Số lượng
    price?: string; // Decimal trong Prisma tương đương với string trong TS
    discount?: number; // Giảm giá (%)
    product_id: number;
    inventory_id: number;
    warehouse_id?: number;
    organization_id?: number;
    key?: string;
    note?: string;
}
export interface IUpdateInventories {
    add: Update[];
    update: Update[];
    delete: { product_id: number; key: number }[];
}
interface Update {
    quantity: number; // Số lượng
    price?: string; // Decimal trong Prisma tương đương với string trong TS
    discount?: number; // Giảm giá (%)
    product_id: number;
    inventory_id: number;
    warehouse_id?: number;
    key?: string;
    organization_id?: number;
    note?: string;
}
