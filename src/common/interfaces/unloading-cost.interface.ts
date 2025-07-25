import { UnloadingStatus } from '@config/app.constant';
import { IOrder } from './order.interface';

export interface IUnloadingCost {
    id?: number;
    price: number;
    quantity: number;
    vat?: number;
    note?: string;
    files?: string[];
    files_add?: string[];
    files_update?: string[];
    files_delete?: string[];
    status?: UnloadingStatus;
    order_id?: number;
    unit_id?: number;
    order?: IOrder;
    unit?: any;
    key?: string;
}
