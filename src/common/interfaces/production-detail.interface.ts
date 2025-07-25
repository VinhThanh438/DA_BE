export interface IProductionDetail {
    id: number;
    quantity: number;
    note?: string;
    production_id: number;
    order_detail_id?: number;
    key?: string;
}

export interface ICreateProductionDetail extends Omit<IProductionDetail, 'id'> {}

export interface IUpdateProductionDetail extends IProductionDetail {}
