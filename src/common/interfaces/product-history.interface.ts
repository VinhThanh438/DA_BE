import { IEmployee } from './employee.interface';
import { IProduct } from './product.interface';

export interface IProductHistoryResponse {
    product: IProduct;
    history: {
        id: number;
        time_at: Date;
        price: number;
        employee?: IEmployee;
    }[];
}
