import { Organizations, Prisma } from '.prisma/client';
import { OrganizationType, PartnerType } from '@config/app.constant';

export interface ICreateAndUpdate {
    name: string;
    type: PartnerType;
}

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
    industry?: string;
    logo?: string;
    responsibility?: string;
    files?: string[];
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
