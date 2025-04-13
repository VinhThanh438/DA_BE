import { PartnerGroups } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreateAndUpdate } from '@common/interfaces/company.interface';
import { PartnerGroupRepo } from '@common/repositories/partner-group.repo';

export class PartnerGroupService {
    public static async paginate(body: IPaginationInput): Promise<IPaginationResponse> {
        return PartnerGroupRepo.paginate(body);
    }

    public static async create(body: ICreateAndUpdate): Promise<IIdResponse> {
        const exist = await PartnerGroupRepo.findOne({ name: body.name });
        if (exist) {
            throw new APIError({
                message: 'common.existed',
                status: StatusCode.BAD_REQUEST,
            });
        }
        const id = await PartnerGroupRepo.create(body);
        return { id };
    }

    public static async update(updateId: number, body: ICreateAndUpdate): Promise<IIdResponse> {
        const id = await PartnerGroupRepo.update({ id: updateId }, body);
        return { id };
    }

    public static async delete(deleteId: number): Promise<IIdResponse> {
        const id = await PartnerGroupRepo.delete({ id: deleteId });
        return { id };
    }

    public static async findById(id: number): Promise<Partial<PartnerGroups | null>> {
        const data = await PartnerGroupRepo.findOne({ id });
        return data;
    }
}
