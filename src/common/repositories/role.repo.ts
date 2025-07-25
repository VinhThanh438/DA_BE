import { Roles, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { RoleSelection, RoleSelectionAll } from './prisma/prisma.select';

export class RoleRepo extends BaseRepo<Roles, Prisma.RolesSelect, Prisma.RolesWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().roles;
    protected defaultSelect = RoleSelection;
    protected detailSelect = RoleSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'roles';
}
