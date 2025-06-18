import { Prisma } from '.prisma/client';
import { EmployeeSelection } from './employee.select';
import { OrganizationSelectionWithAllSubs } from './organization.select';
import { RoleSelection } from './role.select';
import { OrganizationSelection } from './base.select';

export const UserSelectionWithoutPassword: Prisma.UsersSelect = {
    id: true,
    code: true,
    device_uid: true,
    username: true,
    email: true,
    employee_id: true,
};

export const UserSelection: Prisma.UsersSelect = {
    ...UserSelectionWithoutPassword,
    password: true,
    is_first_loggin: true,
    is_default: true,
    is_disabled: true,
};

export const UserRoleSelection: Prisma.UserRolesSelect = {
    organization_id: true,
    organization: {
        select: OrganizationSelection,
    },
    role_id: true,
    role: {
        select: RoleSelection,
    },
};

export const UserSelectionAll: Prisma.UsersSelect = {
    ...UserSelectionWithoutPassword,
    employee: {
        select: EmployeeSelection,
    },
    organization: {
        select: OrganizationSelectionWithAllSubs,
    },
    user_roles: {
        select: UserRoleSelection,
    },
};

export const UserSelectionInfo: Prisma.UsersSelect = {
    ...UserSelectionWithoutPassword,
    employee: {
        select: EmployeeSelection,
    },
};
