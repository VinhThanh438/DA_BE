export interface IBomDetail {
    id: number
    quantity: number;
    material_id: number;
    unit_id: number;
    note?: string
    key?: string;
}

export interface ICreateBomDetail extends Omit<IBomDetail, 'id'> { }

export interface IUpdateBomDetail extends IBomDetail { }