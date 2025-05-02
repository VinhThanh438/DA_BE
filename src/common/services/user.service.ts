import { Prisma, Users } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import { IIdResponse } from '@common/interfaces/common.interface';
import { ICreateUser, IEventUserFirstLoggin, IUpdateEmployeeAccountStatus } from '@common/interfaces/user.interface';
import { UserRepo } from '@common/repositories/user.repo';
import { BaseService } from './base.service';
import logger from '@common/logger';
import eventbus from '@common/eventbus';
import { EVENT_USER_CREATED_OR_DELETED } from '@config/event.constant';
import { EmployeeRepo } from '@common/repositories/employee.repo';

export class UserService extends BaseService<Users, Prisma.UsersSelect, Prisma.UsersWhereInput> {
    private static instance: UserService;
    private employeeRepo: EmployeeRepo = new EmployeeRepo();

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
        const existUser = await this.repo.findOne({ username: body.username, email: body.email });
        if (existUser) {
            throw new APIError({
                message: 'user.already-exists',
                status: StatusCode.BAD_REQUEST,
            });
        }

        const employee = await this.employeeRepo.findOne({ id: body.employee_id });
        if (!employee) {
            throw new APIError({
                message: 'employee.not-found',
                status: StatusCode.BAD_REQUEST,
            });
        }

        const id = await this.repo.create(body);
        if (body.employee_id) {
            eventbus.emit(EVENT_USER_CREATED_OR_DELETED, {
                employeeId: body.employee_id,
                status: true,
            } as IUpdateEmployeeAccountStatus);
        }
        return { id };
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
        const user = await this.repo.isExist({ id });
        if (!user) {
            throw new APIError({
                message: 'common.not-found',
                status: StatusCode.BAD_REQUEST,
            });
        }

        const updatedId = await this.repo.update({ id }, body);
        return { id: updatedId };
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
}
