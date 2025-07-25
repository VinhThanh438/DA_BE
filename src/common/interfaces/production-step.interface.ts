export interface IProductionStep {
    id: number
    name: string
    note?: string
    key?: string
}

export interface ICreateIProductionStep extends Omit<IProductionStep, 'id'> { }

export interface IUpdateIProductionStep extends IProductionStep { }