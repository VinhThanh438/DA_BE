import { APIError } from '@common/error/api.error';
import { ErrorKey, StatusCode } from '@common/errors';
import { ICreateClause, IPaginationInputClause } from '@common/interfaces/clause.interface';
import { IIdResponse, IPaginationResponse } from '@common/interfaces/common.interface';
import { ClauseRepo } from '@common/repositories/clause.repo';

export class ClauseService {
    private static clauseRepo: ClauseRepo = new ClauseRepo();
    public static async create(body: ICreateClause): Promise<IIdResponse> {
        const exist = await this.clauseRepo.findOne({ name: body.name });
        if (exist) {
            throw new APIError({
                message: 'common.existed',
                status: StatusCode.BAD_REQUEST,
                errors: [`name.${ErrorKey.EXISTED}`],
            });
        }
        const id = await this.clauseRepo.create(body);
        return { id };
    }
    public static async getAll(
        body: IPaginationInputClause,
        organization_id: number | null,
    ): Promise<IPaginationResponse> {
        return this.clauseRepo.getAll(body, true, organization_id);
    }
    public static async delete(id: number): Promise<IIdResponse> {
        const exist = await this.clauseRepo.findOne({ id });
        if (!exist) {
            throw new APIError({
                message: 'common.not_found',
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const deletedId = await this.clauseRepo.delete({ id });
        return { id: deletedId };
    }
    public static async update(id: number, body: ICreateClause): Promise<IIdResponse> {
        const exist = await this.clauseRepo.findOne({ id });
        if (!exist) {
            throw new APIError({
                message: 'common.not_found',
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const checkExistClauseName = await this.clauseRepo.findOne({ name: body.name });
        if (checkExistClauseName) {
            throw new APIError({
                message: 'common.existed',
                status: StatusCode.BAD_REQUEST,
                errors: [`name.${ErrorKey.EXISTED}`],
            });
        }
        const updatedId = await this.clauseRepo.update({ id }, body);
        return { id: updatedId };
    }
}
