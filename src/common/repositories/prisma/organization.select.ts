import { Prisma } from '.prisma/client';
import { EmployeeSelection } from './employee.select';
import { OrganizationSelection } from './base.select';

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

export const OrganizationSelectionWithAllSubs: Prisma.OrganizationsSelect = {
    ...OrganizationSelection,
    sub_organization: {
        select: OrganizationSelectionAll,
    },
    parent: {
        select: OrganizationSelection,
    },
    leader: {
        select: EmployeeSelection,
    },
};
