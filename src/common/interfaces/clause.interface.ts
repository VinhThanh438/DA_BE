import { IPaginationInput } from './common.interface';

export interface ICreateClause {
    organization_id?: string;
    name?: string;
    content?: string;
}
export interface IUpdateClause extends ICreateClause {}

export interface IPaginationInputClause extends IPaginationInput {
    organization_id?: number | null;
}
