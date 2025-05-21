import { UserRoles, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { RoleSelection } from './prisma/role.select';

export class UserRoleRepo extends BaseRepo<UserRoles, Prisma.UserRolesSelect, Prisma.UserRolesWhereInput> {
    protected db = DatabaseAdapter.getInstance().userRoles;
    protected defaultSelect = {};
    protected detailSelect = {};
    protected modelKey: keyof Prisma.TransactionClient = 'userRoles';
}
