import { ICreateProductionDetail, IProductionDetail, IUpdateProductionDetail } from './production-detail.interface';
import { IAddUpdateDelete } from './common.interface';
import { IOrder } from './order.interface';
import { IMeshDetail } from './mesh.interface';
import { IProduct } from './product.interface';

export interface IProduction {
    id: number;
    code: string;
    time_at: Date;
    files?: string[];

    idx: number; // Lần sản xuất
    progress: number; // Tiến độ sản xuất
    note?: string;

    total_quantity: number; // Tổng số lượng
    total_weight: number; // Tổng khối lượng
    total_area: number; // Tổng diện tích
    type: string;

    organization_id?: number;
    order_id: number;
    partner_id?: number;
    employee_id?: number;

    order: IOrder;

    details: IProductionDetail[];
    raw_materials?: IRawMaterial[]; // Nguyên liệu thô liên quan
    mesh_production_details: IMeshProductionDetail[]; // Chi tiết sản xuất lưới
    key?: string;
}

export interface ICreateProduction extends Omit<IProduction, 'id'> {}

export interface IUpdateProduction
    extends IProduction,
        IAddUpdateDelete<ICreateProductionDetail, IUpdateProductionDetail> {}

export interface ICreateMeshProduction extends Omit<IProduction, 'id' | 'mesh_production_details'> {
    mesh_production_details: ICreateMeshProductionDetail[];
}

export interface IUpdateMeshProduction
    extends IProduction,
        IAddUpdateDelete<ICreateMeshProductionDetail, IUpdateMeshProductionDetail> {
    raw_materials_add: ICreateRawMaterial[];
    raw_materials_update: IUpdateRawMaterial[];
    raw_materials_delete: number[];
}

export interface IMeshProductionDetail {
    id: number;

    quantity: number; // Số lượng
    length_bar_plate: number; // Số thanh của chiều dài
    width_bar_plate: number; // Số thanh của chiều rộng
    weight: number; // Khối lượng
    area: number; // Diện tích
    tolerance_length: number; // Dung sai chiều dài
    tolerance_width: number; // Dung sai chiều rộng

    mesh_production_id: number;
    mesh_detail_id: number;

    mesh_detail?: IMeshDetail;

    created_at: Date;
    updated_at: Date;
}

export interface ICreateMeshProductionDetail extends Omit<IMeshProductionDetail, 'id' | 'created_at' | 'updated_at'> {}
export interface IUpdateMeshProductionDetail extends IMeshProductionDetail {}

export interface IRawMaterial {
    id: number;
    quantity: number;
    note?: string;

    product_id: number;
    mesh_production_id?: number;

    product: IProduct;

    created_at: Date;
    updated_at: Date;
}

export interface ICreateRawMaterial extends Omit<IRawMaterial, 'id' | 'created_at' | 'updated_at'> {}

export interface IUpdateRawMaterial extends IRawMaterial {}
