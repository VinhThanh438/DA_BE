import { Prisma } from '.prisma/client';
import { EmployeeSelection } from './employee.select';
import { OrganizationSelection } from './organization.select';
import { RepresentativeSelection } from './representative.select';

export const BankSelection: Prisma.BanksSelect = {
    id: true,
    code: true,
    bank: true,
    account_number: true,
    branch: true,
    name: true,
    description: true,
    type: true,
    balance: true,
    responsibility: true,
};
export const BankSelectionAll: Prisma.BanksSelect = {
    ...BankSelection,
};

export const BankSelectionDetail: Prisma.BanksSelect = {
    ...BankSelection,
    employee: {
        select: EmployeeSelection,
    },
    organization: {
        select: OrganizationSelection,
    },
    representative: {
        select: RepresentativeSelection,
    },
};
