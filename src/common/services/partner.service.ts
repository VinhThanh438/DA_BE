import { Partners } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { PartnerRepo } from '@common/repositories/partner.repo';

export class PartnerService {
    public static async paginate(body: IPaginationInput): Promise<IPaginationResponse> {
        return PartnerRepo.paginate(body);
    }

    public static async create(body: any): Promise<IIdResponse> {
        const exist = await PartnerRepo.findOne({ name: body.name });
        if (exist) {
            throw new APIError({
                message: 'common.existed',
                status: StatusCode.BAD_REQUEST,
            });
        }
        const id = await PartnerRepo.create(body);
        return { id };
    }

    public static async update(updateId: number, body: any): Promise<IIdResponse> {
        const id = await PartnerRepo.update({ id: updateId }, body);
        return { id };
    }

    public static async delete(deleteId: number): Promise<IIdResponse> {
        const id = await PartnerRepo.delete({ id: deleteId });
        return { id };
    }

    public static async findById(id: number): Promise<Partial<Partners | null>> {
        const data = await PartnerRepo.findOne({ id });
        return data;
    }
}
