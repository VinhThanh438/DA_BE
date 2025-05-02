import { Products } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey } from '@common/errors';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreateProductGroup, IUpdateProductGroup } from '@common/interfaces/product.interface';
import { ProductGroupRepo } from '@common/repositories/product-group.repo';

export class ProductGroupService {
    private readonly productGroupRepo: ProductGroupRepo = new ProductGroupRepo();
    private static instance: ProductGroupService;

    public static getInstance(): ProductGroupService {
        if (!this.instance) {
            this.instance = new ProductGroupService();
        }
        return this.instance;
    }

    async create(body: ICreateProductGroup): Promise<IIdResponse> {
        const isExist = await this.productGroupRepo.isExist({ name: body.name });
        if (isExist) {
            throw new APIError({
                message: 'common.existed',
                status: ErrorCode.BAD_REQUEST,
                errors: [`name.${ErrorKey.EXISTED}`],
            });
        }
        const output = await this.productGroupRepo.create(body);
        return { id: output };
    }

    async getAll(body: IPaginationInput): Promise<IPaginationResponse> {
        const output = await this.productGroupRepo.paginate(body);
        return output;
    }

    async delete(id: number): Promise<IIdResponse> {
        const isExist = await this.productGroupRepo.isExist({ id: id });
        if (!isExist) {
            throw new APIError({
                message: 'common.not_found',
                status: ErrorCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const output = await this.productGroupRepo.delete({ id: id });
        return { id: output };
    }

    async getById(id: number): Promise<Partial<Products | null>> {
        const data = await this.productGroupRepo.findOne({ id: id });
        if (!data) {
            throw new APIError({
                message: 'common.not_found',
                status: ErrorCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        return data;
    }

    async update(id: number, body: IUpdateProductGroup): Promise<IIdResponse> {
        const isExist = await this.productGroupRepo.isExist({ id: id });
        if (!isExist) {
            throw new APIError({
                message: 'common.not_found',
                status: ErrorCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const existed = await this.productGroupRepo.isExist({ name: body.name });
        if (existed) {
            throw new APIError({
                message: 'common.existed',
                status: ErrorCode.BAD_REQUEST,
                errors: [`name.${ErrorKey.EXISTED}`],
            });
        }
        const output = await this.productGroupRepo.update({ id: id }, body);
        return { id: output };
    }
}
