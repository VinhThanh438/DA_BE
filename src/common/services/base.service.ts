import { APIError } from '@common/error/api.error';
import { ErrorCode } from '@common/errors';
import { generateUniqueCode } from '@common/helpers/generate-unique-code.helper';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import logger from '@common/logger';
import { BaseRepo } from '@common/repositories/base.repo';
import { ModelPrefixMap, PrefixCode } from '@config/app.constant';

export abstract class BaseService<T, S, W> {
    private readonly prefixCode: PrefixCode;

    constructor(protected readonly repo: BaseRepo<T, any, W>) {
        this.prefixCode = this.resolvePrefixCode();
    }

    private resolvePrefixCode(): PrefixCode {
        const className = this.constructor.name;
        const entityName = className.replace(/Service$/, '').toUpperCase();
        const prefix = ModelPrefixMap[entityName];

        if (!prefix) {
            return ModelPrefixMap[PrefixCode.OTHER];
        }

        return prefix;
    }

    public async create(data: Partial<T>): Promise<IIdResponse> {
        try {
            const existed = await this.repo.findOne(data as W);
            if (existed) {
                throw new APIError({
                    message: 'common.existed',
                    status: ErrorCode.BAD_REQUEST,
                });
            }
            const id = await this.repo.create(data);
            return { id };
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            throw error;
        }
    }

    public async findById(id: number): Promise<Partial<T> | null> {
        try {
            const data = await this.repo.findOne({ id } as W, true);
            if (!data) {
                throw new APIError({
                    message: 'common.not-found',
                    status: ErrorCode.BAD_REQUEST,
                });
            }
            return data;
        } catch (error) {
            logger.error(`${this.constructor.name}.findById: `, error);
            throw error;
        }
    }

    public async getAll(): Promise<Partial<T> | null> {
        try {
            const data = await this.repo.findMany();
            return data;
        } catch (error) {
            logger.error(`${this.constructor.name}.getAll: `, error);
            throw error;
        }
    }

    public async getCode(): Promise<string> {
        try {
            const lastRecord = (await this.repo.getLastRecord()) as { code?: string } | null;

            return generateUniqueCode({
                lastCode: lastRecord?.code || null,
                prefix: this.prefixCode,
            });
        } catch (error) {
            logger.error(`${this.constructor.name}.getCode: `, error);
            throw error;
        }
    }

    public async findOne(data: W): Promise<Partial<T> | null> {
        try {
            const result = await this.repo.findOne(data as W, true);
            if (!result) {
                logger.warn(`${this.constructor.name}.findById: `, data);
                throw new APIError({
                    message: 'common.not-found',
                    status: ErrorCode.BAD_REQUEST,
                });
            }
            return result;
        } catch (error) {
            logger.error(`${this.constructor.name}.findById: `, error);
            throw error;
        }
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        try {
            return await this.repo.paginate(query, true);
        } catch (error) {
            logger.error(`${this.constructor.name}.paginate: `, error);
            throw error;
        }
    }

    public async update(id: number, data: Partial<T>): Promise<IIdResponse> {
        try {
            const existed = await this.findById(id);
            if (!existed) {
                throw new APIError({
                    message: 'common.not-found',
                    status: ErrorCode.BAD_REQUEST,
                });
            }
            const dataId = await this.repo.update({ id } as W, data);
            return { id: dataId };
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            throw error;
        }
    }

    public async delete(id: number): Promise<IIdResponse> {
        try {
            const existed = await this.findById(id);
            if (!existed) {
                throw new APIError({
                    message: 'common.not-found',
                    status: ErrorCode.BAD_REQUEST,
                });
            }
            const dataId = await this.repo.delete({ id } as W);
            return { id: dataId };
        } catch (error) {
            logger.error(`${this.constructor.name}.delete: `, error);
            throw error;
        }
    }
}
