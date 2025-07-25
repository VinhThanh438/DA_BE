import { ICreateWorkPricing, IUpdateWorkPricing, IWorkPricing } from "./work-pricing.interface";
import { IBomDetail, ICreateBomDetail, IUpdateBomDetail } from "./bom-detail.interface";

export interface IBom {
    id: number
    product_id: number
    note?: string
    details: IBomDetail[]
    work_pricings: IWorkPricing[]
}

export interface ICreateBom extends Omit<IBom, 'id'> { }

export interface IUpdateBom extends Omit<IBom, 'id' | 'details' | 'work_pricings'> {
    add: ICreateBomDetail[]
    update: IUpdateBomDetail[]
    delete: number[]

    work_pricings_add: ICreateWorkPricing[]
    work_pricings_update: IUpdateWorkPricing[]
    work_pricings_delete: number[]
}
