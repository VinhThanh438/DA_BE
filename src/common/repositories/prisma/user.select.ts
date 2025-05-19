import { Prisma } from '.prisma/client';
import { EmployeeSelection } from './employee.select';
import { OrganizationSelectionWithAllSubs } from './organization.select';

export const UserSelectionWithoutPassword: Prisma.UsersSelect = {
    id: true,
    code: true,
    device_uid: true,
    username: true,
    email: true,
};

export const UserSelection: Prisma.UsersSelect = {
    ...UserSelectionWithoutPassword,
    password: true,
    is_first_loggin: true,
    is_default: true,
    is_disabled: true,
};

export const UserSelectionAll: Prisma.UsersSelect = {
    ...UserSelectionWithoutPassword,
    employee: {
        select: EmployeeSelection,
    },
    organization: {
        select: OrganizationSelectionWithAllSubs,
    },
};
