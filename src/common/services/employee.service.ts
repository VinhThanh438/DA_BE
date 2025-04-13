import { Employees } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { ErrorCode } from '@common/errors';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreateEmployee } from '@common/interfaces/employee.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';

export class EmployeeService {
    public static async paginate(body: IPaginationInput): Promise<IPaginationResponse> {
        const data = await EmployeeRepo.paginate(body);
        return data;
    }

    public static async findById(id: number): Promise<Employees> {
        const data = await EmployeeRepo.findOne({ id }, true);
        if (!data) {
            throw new APIError({
                message: 'common.not-found',
                status: ErrorCode.BAD_REQUEST,
            });
        }
        return data as Employees;
    }

    public static async delete(id: number): Promise<IIdResponse> {
        const data = await EmployeeRepo.isExist({ id });
        if (!data) {
            throw new APIError({
                message: 'common.not-found',
                status: ErrorCode.BAD_REQUEST,
            });
        }
        const result = await EmployeeRepo.delete(id);
        return { id: result.id as number };
    }

    public static async update(id: number, body: ICreateEmployee): Promise<IIdResponse> {
        const data = await EmployeeRepo.isExist({ id });
        if (!data) {
            throw new APIError({
                message: 'common.not-found',
                status: ErrorCode.BAD_REQUEST,
            });
        }
        const result = await EmployeeRepo.update({ id }, body);
        return { id: result.id as number };
    }

    public static async create(body: ICreateEmployee): Promise<IIdResponse> {
        const isExist = await EmployeeRepo.isExist({ code: body.code });
        if (isExist) {
            throw new APIError({
                message: 'common.existed',
                status: ErrorCode.BAD_REQUEST,
            });
        }

        const dataInput = {
            code: body.code,
            email: body.email,
            fullname: body.fullname,
            age: body.age,
            phone_number: body.phone_number,
            description: body.description,
            avatar: body.avatar,
            type: body.type,
            files: body.files,

            education: body.education,
            finance: body.finance,
            identity: body.identity,
            address: body.address,
            emergency_contact: body.emergency_contact,
            contract: body.contract,
            social_insurance: body.social_insurance,
            user_position: body.user_position,
        };
        const data = await EmployeeRepo.create(dataInput);
        return { id: data.id };
    }
}
