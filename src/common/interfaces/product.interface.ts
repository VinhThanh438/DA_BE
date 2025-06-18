import { Products } from '.prisma/client';
import { ProductType } from '@config/app.constant';

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
    price?: number;
    current_price?: number;
    product_group_id?: number;
    unit_id?: number;
    type?: ProductType;
    parent_id?: number; // Optional vì có thể không truyền parent_id khi tạo mới
    extra_units?: IExtraUnits[] | any[]; // Optional vì có thể không truyền productUnits khi tạo mới
    product_histories?: IProductHistory[];
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
}
export interface ICustomUnit {
    id: number;
    name: string;
}

export interface IEventProductHistoryUpdated {
    id: number;
    current_price: number;
}
