import { TransactionWarehouseType } from '@config/app.constant';

export interface ITransactionWarehouse {
    id: number
    time_at: Date
    quantity: number
    real_quantity: number
    convert_quantity: number
    type: TransactionWarehouseType
    note?: string
    order_id?: number
    warehouse_id: number
    inventory_id: number
    inventory_detail_id: number
    product_id: number
    child_id?: number
    organization_id?: number
    inventory_detail?: {
        order_detail_id: number
    },
    price: number
}


export interface ICreateTransactionWarehouse extends Omit<ITransactionWarehouse, 'id'> { }
