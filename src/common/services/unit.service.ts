import { APIError } from '@common/error/api.error';
import { ErrorKey, StatusCode } from '@common/errors';
import { IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreateUnit, IUpdateUnit } from '@common/interfaces/product.interface';
import { UnitRepo } from '@common/repositories/unit.repo';

export class UnitService {
    private readonly unitRepo: UnitRepo = new UnitRepo();
    private static instance: UnitService;

    public static getInstance(): UnitService {
        if (!this.instance) {
            this.instance = new UnitService();
        }
        return this.instance;
    }

    async create(body: ICreateUnit) {
        // const isExist = await this.unitRepo.isExist({ name: body.name });
        // if (isExist) {
        //     throw new APIError({
        //         message: 'common.existed',
        //         status: StatusCode.BAD_REQUEST,
        //         errors: [`name.${ErrorKey.EXISTED}`],
        //     });
        // }
        const output = await this.unitRepo.create(body);
        return { id: output };
    }

    async getAll(body: IPaginationInput): Promise<IPaginationResponse> {
        const output = await this.unitRepo.paginate(body);
        return output;
    }

    async delete(id: number) {
        const isExist = await this.unitRepo.isExist({ id });
        if (!isExist) {
            throw new APIError({
                message: 'common.not_found',
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const output = await this.unitRepo.delete({ id: id });
        return { id: output };
    }

    async update(id: number, body: IUpdateUnit) {
        // const isExist = await this.unitRepo.isExist({ id });
        // if (!isExist) {
        //     throw new APIError({
        //         message: 'common.not_found',
        //         status: StatusCode.BAD_REQUEST,
        //         errors: [`id.${ErrorKey.NOT_FOUND}`],
        //     });
        // }
        const output = await this.unitRepo.update({ id: id }, body);
        return { id: output };
    }

    async getById(id: number) {
        const data = await this.unitRepo.findOne({ id: id });
        if (!data) {
            throw new APIError({
                message: 'common.not_found',
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        return data;
    }
}
