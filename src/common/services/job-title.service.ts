import { JobTitles } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreateAndUpdate } from '@common/interfaces/company.interface';
import { JobTitleRepo } from '@common/repositories/job-title.repo';

export class JobTitleService {
    public static async paginate(body: IPaginationInput): Promise<IPaginationResponse> {
        return JobTitleRepo.paginate(body);
    }

    public static async create(body: ICreateAndUpdate): Promise<IIdResponse> {
        const exist = await JobTitleRepo.findOne({ name: body.name });
        if (exist) {
            throw new APIError({
                message: 'common.existed',
                status: StatusCode.BAD_REQUEST,
            });
        }
        const id = await JobTitleRepo.create(body);
        return { id };
    }

    public static async update(updateId: number, body: ICreateAndUpdate): Promise<IIdResponse> {
        const id = await JobTitleRepo.update({ id: updateId }, body);
        return { id };
    }

    public static async delete(deleteId: number): Promise<IIdResponse> {
        const id = await JobTitleRepo.delete({ id: deleteId });
        return { id };
    }

    public static async findOne(levelId: number): Promise<Partial<JobTitles | null>> {
        const data = await JobTitleRepo.findOne({ id: levelId });
        return data;
    }
}
