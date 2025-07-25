import { BaseService } from './base.service';
import { Roles, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { IRoleModule, IRole, IRoleAction, ROLE_MODULES } from '@common/interfaces/role.interface';
import logger from '@common/logger';
import { RoleRepo } from '@common/repositories/role.repo';

export class RoleService extends BaseService<Roles, Prisma.RolesSelect, Prisma.RolesWhereInput> {
    private static instance: RoleService;

    private constructor() {
        super(new RoleRepo());
    }

    public static getInstance(): RoleService {
        if (!this.instance) {
            this.instance = new RoleService();
        }
        return this.instance;
    }

    public async getAll(): Promise<Partial<Roles>[]> {
        const data = await this.repo.findMany({}, true);
        return data;
    }

    public async create(body: Partial<Roles>): Promise<IIdResponse> {
        // default permissions
        const permissions = {} as Record<IRoleModule, IRoleAction[]>;
        ROLE_MODULES.forEach((m) => {
            permissions[m] = [];
        });

        const id = await this.repo.create({ name: body.name, permissions });
        return { id };
    }

    public async updatePermission(id: number, body: IRole): Promise<any> {
        await this.repo.update(
            { id },
            {
                permissions: body.permissions,
            },
        );
        return id;
    }

    public hasPermission(role: Roles, module: IRoleModule, action: IRoleAction): boolean {
        try {
            const permissions = role.permissions as Record<IRoleModule, IRoleAction[]>;

            if (!permissions || !permissions[module]) {
                return false;
            }

            return permissions[module].includes(action);
        } catch (error) {
            logger.error('Error checking permissions:', error);
            return false;
        }
    }
}
