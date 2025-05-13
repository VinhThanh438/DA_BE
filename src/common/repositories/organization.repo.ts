import { Organizations, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EmployeeSelection } from './employee.repo';

export const OrganizationSelection: Prisma.OrganizationsSelect = {
    id: true,
    name: true,
    code: true,
    responsibility: true,
    establishment: true,
    industry: true,
    logo: true,
    type: true,
    files: true,
};

export const OrganizationSelectionAll: Prisma.OrganizationsSelect = {
    ...OrganizationSelection,
    sub_organization: {
        select: OrganizationSelection,
    },
    parent: {
        select: OrganizationSelection,
    },
    leader: {
        select: EmployeeSelection,
    },
};

export class OrganizationRepo extends BaseRepo<
    Organizations,
    Prisma.OrganizationsSelect,
    Prisma.OrganizationsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().organizations;
    protected defaultSelect = OrganizationSelection;
    protected detailSelect = OrganizationSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'organizations';
    protected searchableFields = ['name', 'code'];
}
