import { IPaginationInfo, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { Organizations, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EmployeeSelection } from './employee.repo';
import { OrganizationType } from '@config/app.constant';

export const OrganizationSelection: Prisma.OrganizationsSelect = {
    id: true,
    name: true,
    code: true,
    responsibility: true,
    establishment: true,
    type: true,
};

export const OrganizationSelectionAll: Prisma.OrganizationsSelect = {
    ...OrganizationSelection,
    sub_organization: {
        select: OrganizationSelection, // Recursive selection for sub-organizations
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
}
