import { Prisma } from '.prisma/client';

export const RoleSelection: Prisma.RolesSelect = {
    id: true,
    name: true,
};

export const RoleSelectionAll: Prisma.RolesSelect = {
    id: true,
    name: true,
    permissions: true,
};
