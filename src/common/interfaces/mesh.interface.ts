import { IAddUpdateDelete } from './common.interface';

export interface IMesh {
    id: number;
    quotation_id: number;
    total_quantity: number
    total_weight: number
    total_area: number
    note?: string;
    scope_name?: string;
    quantity_name?: string;
    length_name?: string;
    width_name?: string;
    weight_name?: string;
    area_name?: string;

    details: IMeshDetail[];
}

export interface ICreateMesh extends Omit<IMesh, 'id'> {}

export interface IUpdateMesh extends IMesh, IAddUpdateDelete<ICreateMeshDetail, IUpdateMeshDetail> {}

export interface IMeshDetail {
    id: number;
    quantity: number;
    name: string;
    length: number;
    length_spacing: number;
    length_phi: number;
    length_left: number;
    length_right: number;
    width: number;
    width_spacing: number;
    width_phi: number;
    width_left: number;
    width_right: number;
    product_id: number;
    area_id?: number;
    key?: string;
}

export interface ICreateMeshDetail extends Omit<IMeshDetail, 'id'> {}

export interface IUpdateMeshDetail extends IMeshDetail {}
