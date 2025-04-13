import { Prisma } from '.prisma/client';
import { ICreatePermission } from '@common/interfaces/permission.interface';
import { PermissionRepo } from '@common/repositories/permission.repo';

export class PermissionService {
    public static async getAll() {
        const data = await PermissionRepo.getAll();
        return data;
    }

    public static async create(body: ICreatePermission) {
        const data = await PermissionRepo.create(body);
        return data;
    }
}
