import { Prisma } from '.prisma/client';
import { EmployeeSelection } from './employee.select';

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
    address: true,
    phone: true,
    hotline: true,
    email: true,
    website: true,
    tax_code: true,
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
