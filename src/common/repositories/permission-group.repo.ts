import { PermissionGroups, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';

export class PermissionGroupRepo {
    private static db = DatabaseAdapter.getInstance().permissionGroups;

    public static async delete(id: number): Promise<Partial<PermissionGroups> | null> {
        return this.db.delete({
            where: { id },
        });
    }

    public static async findOne(where: Prisma.PermissionGroupsWhereInput): Promise<PermissionGroups | null> {
        return this.db.findFirst({
            where,
        });
    }

    public static async create(data: Prisma.PermissionGroupsCreateInput): Promise<PermissionGroups> {
        return this.db.create({
            data,
        });
    }
}
