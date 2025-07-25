export interface IArea {
    id: number
    name: string
    key?: string
}

export interface ICreateArea extends Omit<IArea, 'id'> { }

export interface IUpdateArea extends IArea { }