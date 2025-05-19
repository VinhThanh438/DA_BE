import { Products, Units } from '.prisma/client';
import { ProductType } from '@config/app.constant';

export interface ICreateProduct {
    id?: number;
    name: string;
    code?: string;
    image?: string;
    vat?: number;
    packing_standard?: string;
    note?: string;
    product_group_id?: number;
    unit_id?: number;
    type?: ProductType;
    extra_units?: IExtraUnits[] | any[]; // Optional vì có thể không truyền productUnits khi tạo mới
}
export interface IExtraUnits {
    key: string;
    unit_id: number;
    conversion_rate: number;
}

export interface IProducts extends Products {
    extra_units?: IExtraUnits[]; // Optional vì có thể không truyền productUnits khi tạo mới
}
export interface IUpdateProduct {
    id?: number;
    name?: string;
    code?: string;
    image?: string;
    vat?: number;
    packing_standard?: string;
    note?: string;
    product_group_id?: number;
    unit_id?: number;
    type?: ProductType;
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
