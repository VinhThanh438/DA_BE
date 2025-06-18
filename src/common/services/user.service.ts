import { Prisma, Users } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey, StatusCode } from '@common/errors';
import { IIdResponse } from '@common/interfaces/common.interface';
import { ICreateUser, IEventUserFirstLoggin, IUpdateEmployeeAccountStatus } from '@common/interfaces/user.interface';
import { UserRepo } from '@common/repositories/user.repo';
import { BaseService } from './base.service';
import logger from '@common/logger';
import eventbus from '@common/eventbus';
import { EVENT_USER_CREATED_OR_DELETED } from '@config/event.constant';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { UserRoleRepo } from '@common/repositories/user-role.repo';
import bcrypt from 'bcryptjs';
import { RoleRepo } from '@common/repositories/role.repo';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { EmployeeSelection } from '@common/repositories/prisma/employee.select';
import { OrganizationSelection } from '@common/repositories/prisma/base.select';

export class UserService extends BaseService<Users, Prisma.UsersSelect, Prisma.UsersWhereInput> {
    private static instance: UserService;
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private userRoleRepo: UserRoleRepo = new UserRoleRepo();
    private roleRepo: RoleRepo = new RoleRepo();
    private organizationRepo: OrganizationRepo = new OrganizationRepo();

    private constructor() {
        super(new UserRepo());
    }

    public static getInstance(): UserService {
        if (!this.instance) {
            this.instance = new UserService();
        }
        return this.instance;
    }

    public async findById(id: number): Promise<Partial<Users>> {
        const data = await this.findOne({ id }, true);
        if (!data) {
            throw new APIError({
                message: 'common.not-found',
                status: StatusCode.BAD_REQUEST,
            });
        }
        return data;
    }

    public async createUser(body: ICreateUser): Promise<IIdResponse> {
        try {
            let id: number = 0;
            await this.db.$transaction(async (tx) => {
                await this.isExist({ username: body.username }, false, tx);

                await this.validateForeignKeys(body, {
                    employee_id: this.employeeRepo,
                });

                const { user_roles, password, ...userData } = body;
                const hashedPassword = await bcrypt.hash(password, 10);
                id = await this.repo.create(
                    {
                        ...userData,
                        password: hashedPassword,
                    },
                    tx,
                );
                if (body.employee_id) {
                    eventbus.emit(EVENT_USER_CREATED_OR_DELETED, {
                        employeeId: body.employee_id,
                        status: true,
                    } as IUpdateEmployeeAccountStatus);
                }

                // handle user roles
                if (user_roles && user_roles.length > 0) {
                    await this.validateForeignKeys(
                        user_roles,
                        {
                            role_id: this.roleRepo,
                            organization_id: this.organizationRepo,
                        },
                        tx,
                    );

                    const userRolesToCreate = user_roles.map((role) => ({
                        user_id: id,
                        role_id: role.role_id,
                        organization_id: role.organization_id,
                    }));

                    await this.userRoleRepo.createMany(userRolesToCreate, tx);
                }
            });

            return { id };
        } catch (error) {
            throw error;
        }
    }

    public async seedAdmin(body: ICreateUser): Promise<IIdResponse> {
        const id = await this.repo.create(body);
        return { id };
    }

    public async updateLoginStatus(body: IEventUserFirstLoggin): Promise<IIdResponse> {
        const id = await this.repo.update(
            { id: body.id },
            {
                is_first_loggin: body.status,
                device_uid: [body.device ?? ''],
            },
        );
        return { id };
    }

    public async findUser(data: Prisma.UsersWhereInput, isDefaultSelect = false): Promise<Partial<Users> | null> {
        try {
            const result = await this.repo.findOne(data, isDefaultSelect);
            return result;
        } catch (error) {
            logger.error(`${this.constructor.name}.findUser: `, error);
            throw error;
        }
    }

    public async updateUser(id: number, body: ICreateUser): Promise<IIdResponse> {
        try {
            const userExists = await this.findById(id);
            await this.db.$transaction(async (tx) => {
                if (body.username && body.username !== userExists.username) {
                    await this.isExist({ username: body.username }, false, tx);
                }

                if (body.employee_id && body.employee_id !== userExists.employee_id) {
                    await this.validateForeignKeys(body, {
                        employee_id: this.employeeRepo,
                    });
                }

                const { user_roles, password, ...userData } = body;
                let updateData: any = { ...userData };
                if (password) {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    updateData.password = hashedPassword;
                }

                await this.repo.update({ id }, updateData, tx);

                if (user_roles) {
                    await this.userRoleRepo.deleteMany({ user_id: id }, tx);
                    if (user_roles.length > 0) {
                        await this.validateForeignKeys(
                            user_roles,
                            {
                                role_id: this.roleRepo,
                                organization_id: this.organizationRepo,
                            },
                            tx,
                        );

                        const userRolesToCreate = user_roles.map((role) => ({
                            user_id: id,
                            role_id: role.role_id,
                            organization_id: role.organization_id,
                        }));

                        await this.userRoleRepo.createMany(userRolesToCreate, tx);
                    }
                }
            });

            return { id };
        } catch (error) {
            throw error;
        }
    }

    public async deleteUser(id: number): Promise<IIdResponse> {
        const user = await this.repo.findOne({ id }, true);
        if (!user) {
            throw new APIError({
                message: 'common.not-found',
                status: StatusCode.BAD_REQUEST,
            });
        }
        if (user.employee_id) {
            eventbus.emit(EVENT_USER_CREATED_OR_DELETED, {
                employeeId: user.employee_id,
                status: false,
            } as IUpdateEmployeeAccountStatus);
        }
        const deletedId = await this.repo.delete({ id });
        return { id: deletedId };
    }

    async getEmployeeByUser(id: number) {
        const data = await this.db.users.findFirst({
            where: { id },
            select: {
                id: true,
                employee: { select: EmployeeSelection },
                organization: { select: OrganizationSelection },
            },
        });

        return data?.employee || null;
    }
}
