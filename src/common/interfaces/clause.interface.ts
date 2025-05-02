import { IPaginationInput } from './common.interface';

export interface ICreateClause {
    organization_id?: string;
    name?: string;
    content?: string;
    max_dept_amount?: number | null;
    max_dept_day?: number | null;
}
export interface IUpdateClause extends ICreateClause {}

export interface IPaginationInputClause extends IPaginationInput {
    organization_id?: number | null;
}
