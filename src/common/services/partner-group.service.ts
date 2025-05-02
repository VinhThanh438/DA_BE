import { PartnerGroups } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { ErrorKey, StatusCode } from '@common/errors';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreateAndUpdate } from '@common/interfaces/company.interface';
import { PartnerGroupRepo } from '@common/repositories/partner-group.repo';

export class PartnerGroupService {
    private static repo = new PartnerGroupRepo();

    public static async paginate(body: IPaginationInput, type: string | ''): Promise<IPaginationResponse> {
        return this.repo.paginate(body, true, { type: type });
    }

    public static async create(body: ICreateAndUpdate): Promise<IIdResponse> {
        const exist = await this.repo.findOne({ name: body.name, type: body.type });
        if (exist) {
            throw new APIError({
                message: 'common.existed',
                status: StatusCode.BAD_REQUEST,
                errors: [`name.${ErrorKey.EXISTED}`],
            });
        }
        const id = await this.repo.create(body);
        return { id };
    }

    public static async update(updateId: number, body: ICreateAndUpdate): Promise<IIdResponse> {
        const exist = await this.repo.findOne({ id: updateId });
        if (!exist) {
            throw new APIError({
                message: 'common.not_found',
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const name_exist = await this.repo.findOne({ name: body.name, type: body.type });
        if (name_exist) {
            throw new APIError({
                message: 'common.existed',
                status: StatusCode.BAD_REQUEST,
                errors: [`name.${ErrorKey.EXISTED}`],
            });
        }
        const id = await this.repo.update({ id: updateId }, body);
        return { id };
    }

    public static async delete(deleteId: number): Promise<IIdResponse> {
        const exist = await this.repo.findOne({ id: deleteId });
        if (!exist) {
            throw new APIError({
                message: 'common.not_found',
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const id = await this.repo.delete({ id: deleteId });
        return { id };
    }

    public static async findById(id: number): Promise<Partial<PartnerGroups | null>> {
        const data = await this.repo.findOne({ id });
        return data;
    }
}
