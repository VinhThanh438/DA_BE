import { DeptType } from '@config/app.constant';
import { IPaginationInput } from './common.interface';

export interface IRepresentDebtQueryFilter extends IPaginationInput {
    partnerId?: number;
    type?: DeptType;
}
