export interface IStockTracking {
    id: number;
    time_at: Date;
    current_balance: number;
    product_id: number;
    child_id?: number;
    price: number;
    warehouse_id: number;
    transaction_warehouse_id: number;
}

export interface ICreateStockTracking extends Omit<IStockTracking, 'id'> { }

export interface IUpdateStockTracking extends Partial<Omit<IStockTracking, 'id'>> { }
