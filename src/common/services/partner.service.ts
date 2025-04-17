import { Partners } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreatePartner, IPaginationInputPartner, IUpdatePartner } from '@common/interfaces/partner.interface';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { PartnerType } from '@config/app.constant';

export class PartnerService {
    private static repo = new PartnerRepo();

    public static async paginate(body: IPaginationInput): Promise<IPaginationResponse> {
        return this.repo.paginate(body, true);
    }
    public static async getAll(
        body: IPaginationInputPartner,
        type: PartnerType | '',
        organization_id: number | null,
    ): Promise<IPaginationResponse> {
        return this.repo.getAll(body, true, type, organization_id);
    }
    public static async create(body: ICreatePartner): Promise<IIdResponse> {
        const exist = await this.repo.findOne({ name: body.name }, true);
        if (exist) {
            throw new APIError({
                message: 'common.existed',
                status: StatusCode.BAD_REQUEST,
            });
        }
        const id = await this.repo.create(body);
        return { id };
    }

    public static async update(updateId: number, body: IUpdatePartner): Promise<IIdResponse> {
        const id = await this.repo.update({ id: updateId }, body);
        return { id };
    }

    public static async delete(deleteId: number): Promise<IIdResponse> {
        const id = await this.repo.delete({ id: deleteId });
        return { id };
    }

    public static async findById(id: number): Promise<Partial<Partners | null>> {
        const data = await this.repo.findOne({ id }, true);
        if (!data) {
            throw new APIError({
                message: 'common.not-found',
                status: StatusCode.BAD_REQUEST,
            });
        }
        return data;
    }
}
