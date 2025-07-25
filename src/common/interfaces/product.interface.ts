import { Products } from '.prisma/client';
import { ProductType } from '@config/app.constant';
import { IStockTracking } from './stock-tracking.interface';

export interface IProductHistory {
    id: number;
    price: number;
    time_at: Date;
    product_id: number;
}

export interface IProduct {
    id?: number;
    name: string;
    code?: string;
    image?: string;
    vat?: number;
    packing_standard?: string;
    note?: string;
    current_price?: number;
    product_group_id?: number;
    unit_id?: number;
    type?: ProductType;
    parent_id?: number; // Optional vì có thể không truyền parent_id khi tạo mới
    extra_units?: IExtraUnits[] | any[]; // Optional vì có thể không truyền productUnits khi tạo mới
    product_histories?: IProductHistory[];
    is_public?: boolean; // Optional, mặc định là false
    // details?: IProductDetail[]
    stock_trackings?: IStockTracking[]; // Thêm thông tin tồn kho
    stock_trackings_child?: IStockTracking[]; // Thêm thông tin tồn kho
    unit: IUnit
    current_balance?: number; // Optional, có thể không truyền current_balance khi tạo mới
}
export interface IExtraUnits {
    key: string;
    unit_id: number;
    conversion_rate: number;
}

export interface IProducts extends Products {
    extra_units?: IExtraUnits[]; // Optional vì có thể không truyền productUnits khi tạo mới
}
export interface IUpdateProduct extends IProduct {
    add?: IExtraUnits[];
    update?: IExtraUnits[];
    delete?: {
        unit_id?: number;
        key?: string;
    }[];
    // details_add?: ICreateProductDetail[];
    // details_update?: IUpdateProductDetail[];
    // details_delete?: number[];
}
export interface ICreateProductGroup {
    name: string;
}
export interface IUpdateProductGroup {
    name?: string;
}
export interface ICreateUnit {
    name: string;
}
export interface IUpdateUnit {
    name?: string;
    is_default?: boolean;
}
export interface ICustomUnit {
    id: number;
    name: string;
}

export interface IEventProductHistoryUpdated {
    id: number;
    current_price: number;
}

export interface IProductStock {
    id?: number;
    time_at?: Date;
    convert_quantity: number;
    balance_quantity: number;
    type: 'in' | 'out';
    note?: string;
    product_id: number;
    warehouse_id: number;
    transaction_warehouse_id?: number;
}

export interface IWarehouseProduct extends IProduct {
    inventories?: {
        time_at?: Date;
        current_balance?: number;
        price?: number;
    }[];
    product_stocks?: IProductStock[]; // Thêm thông tin tồn kho chi tiết
}


export interface IUnit{
    id: number;
    name: string;
    key?: string; // Optional, có thể không có key
}