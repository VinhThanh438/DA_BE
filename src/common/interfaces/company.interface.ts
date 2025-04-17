export interface ICreateAndUpdate {
    name: string;
}

import { Organizations, Prisma } from '.prisma/client';
import { OrganizationType } from '@config/app.constant';

export interface IOrganizationTypes
    extends PrismaModelTypes<Organizations, Prisma.OrganizationsSelect, Prisma.OrganizationsWhereInput> {}

export interface PrismaModelTypes<T, S extends Record<string, any>, W> {
    model: T;
    select: S;
    where: W;
}

export interface ICreateOrganization {
    name: string;
    code: string;
    responsibility?: string;
    files?: any;
    establishment?: DateString;
    type: OrganizationType;
    leader_id: number;
    parent_id: number;
}

export interface ICreateUpdateJobPosition {
    name: string;
    level?: string;
    description?: string;
    position_id?: number;
    organization_id?: number;
}
