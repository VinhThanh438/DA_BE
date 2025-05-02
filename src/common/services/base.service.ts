import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey, StatusCode } from '@common/errors';
import { filterDataExclude } from '@common/helpers/filter-data.helper';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import logger from '@common/logger';
import { BaseRepo } from '@common/repositories/base.repo';
import { Prisma } from '@prisma/client';

export abstract class BaseService<T, S, W> {
    protected db = DatabaseAdapter.getInstance();

    constructor(protected readonly repo: BaseRepo<T, any, W>) {}
    
    protected async validateForeignKeys<T extends { [key: string]: any }>(
        data: T[] | T,
        foreignKeysAndRepos: Record<
            string,
            { findOne: (params: any, isSelectDetail: boolean, tx?: Prisma.TransactionClient) => Promise<any> }
        >,
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        if (!data || Object.keys(foreignKeysAndRepos).length === 0) return;

        const invalidMessages: string[] = [];

        const dataArray = Array.isArray(data) ? data : [data];

        for (const item of dataArray) {
            for (const [foreignKey, repo] of Object.entries(foreignKeysAndRepos)) {
                const foreignKeyValue = item[foreignKey];
                if (foreignKeyValue != null) {
                    const existingRecord = await repo.findOne({ id: foreignKeyValue }, false, tx);
                    if (!existingRecord) {
                        const errorKey =
                            item.key != null ? `${foreignKey}.not_found.${item.key}` : `${foreignKey}.not_found`;
                        invalidMessages.push(errorKey);
                    }
                }
            }
        }

        if (invalidMessages.length > 0) {
            throw new APIError({
                status: StatusCode.BAD_REQUEST,
                message: 'common.foreign-key-constraint-violation',
                errors: invalidMessages,
            });
        }
    }

    protected async isExist(
        data: { [key: string]: any },
        includeSelf: boolean = false,
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        if (!data || Object.keys(data).length === 0) return;
        if (includeSelf && !data.id) {
            logger.warn(`${this.constructor.name}.isExist: Missing id in update method`);
            throw new APIError({
                status: StatusCode.SERVER_ERROR,
                message: 'common.developer-error',
            });
        }

        const existMessages: string[] = [];

        for (const [field, value] of Object.entries(data)) {
            if (value != null) {
                const filter = includeSelf ? { [field]: value, NOT: { id: data.id } } : { [field]: value };

                const existedRecord = await this.repo.findOne(filter as W, false, tx);
                if (existedRecord) {
                    existMessages.push(`${field}.existed`);
                }
            }
        }

        if (existMessages.length > 0) {
            throw new APIError({
                status: StatusCode.BAD_REQUEST,
                message: 'common.existed',
                errors: existMessages,
            });
        }
    }

    protected filterData(data: any, excludedFields: string[], listFields: string[]): any[] {
        const result = filterDataExclude(data, excludedFields, listFields);
        return Array.isArray(result) ? result : [result];
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
                    errors: [`id.${ErrorKey.NOT_FOUND}`],
                });
            }
            return data;
        } catch (error) {
            logger.error(`${this.constructor.name}.findById: `, error);
            throw error;
        }
    }

    public async getAll(): Promise<Partial<T>[]> {
        try {
            const data = await this.repo.findMany();
            return data;
        } catch (error) {
            logger.error(`${this.constructor.name}.getAll: `, error);
            throw error;
        }
    }

    public async findOne(data: W, isDefaultSelect = false): Promise<Partial<T> | null> {
        try {
            const result = await this.repo.findOne(data as W, isDefaultSelect);
            if (!result) {
                throw new APIError({
                    message: 'common.not_found',
                    status: ErrorCode.BAD_REQUEST,
                });
            }
            return result;
        } catch (error) {
            logger.error(`${this.constructor.name}.findOne: `, error);
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

    public async update(id: number, data: Partial<T>, ...args: any[]): Promise<IIdResponse> {
        try {
            const existed = await this.findById(id);
            if (!existed) {
                throw new APIError({
                    message: 'common.not-found',
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`id.${ErrorKey.NOT_FOUND}`],
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
                    errors: [`id.${ErrorKey.NOT_FOUND}`],
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
