export interface IWorkPricing {
    id: number
    price: number;
    production_step_id: number;
    unit_id: number;
    bom_id: number;
    note?: string
    key?: string;
}

export interface ICreateWorkPricing extends Omit<IWorkPricing, 'id'> { }

export interface IUpdateWorkPricing extends IWorkPricing { }