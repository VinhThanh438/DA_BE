import { Prisma, Users } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { ErrorCode, StatusCode } from '@common/errors';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreateUser, IEventUserFirstLoggin } from '@common/interfaces/user.interface';
import { UserRepo } from '@common/repositories/user.repo';
import { EmployeeService } from './employee.service';
import { ADMIN_USER_NAME } from '@common/environment';

export class UserService {
    public static async findOne(
        where: Prisma.UsersWhereInput,
        select?: Prisma.UsersSelect,
    ): Promise<Partial<Users | null>> {
        return UserRepo.findOne(where, select);
    }

    public static async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const data = await UserRepo.paginate(query);
        return data;
    }

    public static async findById(id: number): Promise<Partial<Users>> {
        const data = await UserService.findOne({ id });
        if (!data) {
            throw new APIError({
                message: 'common.not-found',
                status: StatusCode.BAD_REQUEST,
            });
        }
        return data;
    }

    public static async create(body: ICreateUser): Promise<IIdResponse> {
        const existUser = await UserRepo.findOne({ username: body.username, email: body.email });
        if (existUser) {
            throw new APIError({
                message: 'common.not-found',
                status: StatusCode.BAD_REQUEST,
            });
        }

        const employee = await EmployeeService.findById(body.employee_id as number);
        if (!employee) {
            throw new APIError({
                message: 'common.not-found',
                status: StatusCode.BAD_REQUEST,
            });
        }
        const data = await UserRepo.create(body);
        return { id: data.id };
    }

    public static async seedAdmin(body: ICreateUser): Promise<IIdResponse> {
        const data = await UserRepo.create(body);
        return { id: data.id };
    }

    public static async updateLogginStatus(body: IEventUserFirstLoggin): Promise<IIdResponse> {
        const data = await UserRepo.update({ id: body.id }, { is_first_loggin: false, device_uid: [body.device] });
        return { id: data.id };
    }

    public static async delete(id: number): Promise<IIdResponse> {
        const data = await UserRepo.isExist({ id });
        if (!data) {
            throw new APIError({
                message: 'common.not-found',
                status: ErrorCode.BAD_REQUEST,
            });
        }
        const result = await UserRepo.delete(id);
        return { id: result.id as number };
    }

    public static async update(id: number, body: ICreateUser): Promise<IIdResponse> {
        const data = await UserRepo.isExist({ id });
        if (!data) {
            throw new APIError({
                message: 'common.not-found',
                status: ErrorCode.BAD_REQUEST,
            });
        }
        const result = await UserRepo.update({ id }, body);
        return { id: result.id as number };
    }
}
