import { Levels } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreateAndUpdate } from '@common/interfaces/company.interface';
import { LevelRepo } from '@common/repositories/level.repo';

export class LevelService {
    public static async paginate(body: IPaginationInput): Promise<IPaginationResponse> {
        return LevelRepo.paginate(body);
    }

    public static async create(body: ICreateAndUpdate): Promise<IIdResponse> {
        const exist = await LevelRepo.findOne({ name: body.name });
        if (exist) {
            throw new APIError({
                message: 'common.existed',
                status: StatusCode.BAD_REQUEST,
            });
        }
        const id = await LevelRepo.create(body);
        return { id };
    }

    public static async update(updateId: number, body: ICreateAndUpdate): Promise<IIdResponse> {
        const id = await LevelRepo.update({ id: updateId }, body);
        return { id };
    }

    public static async delete(deleteId: number): Promise<IIdResponse> {
        const id = await LevelRepo.delete({ id: deleteId });
        return { id };
    }

    public static async findOne(levelId: number): Promise<Partial<Levels | null>> {
        const data = await LevelRepo.findOne({ id: levelId });
        return data;
    }
}
