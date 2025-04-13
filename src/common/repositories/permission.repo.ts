import { Permissions, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';

export class PermissionRepo {
    private static db = DatabaseAdapter.getInstance().permissions;

    public static async delete(id: number): Promise<Partial<Permissions> | null> {
        return this.db.delete({
            where: { id },
        });
    }

    public static async findOne(where: Prisma.PermissionsWhereInput): Promise<Permissions | null> {
        return this.db.findFirst({
            where,
        });
    }

    public static async create(data: Prisma.PermissionsCreateInput): Promise<Permissions> {
        return this.db.create({
            data,
        });
    }

    public static async getAll(where: Prisma.PermissionsWhereInput = {}): Promise<Partial<Permissions>[]> {
        return this.db.findMany({
            where: {
                ...where,
            },
            select: {
                id: true,
                name: true,
                type: true,
            },
        });
    }
}
