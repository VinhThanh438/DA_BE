import { TransactionWarehouseType } from '@config/app.constant';

export interface ITransactionWarehouse {
    // inventory: any;
    // warehouse: any;
    // inventory_detail: any;
    // quantity: number;
    real_quantity: number;
    time_at: Date;
    type: TransactionWarehouseType;
}
