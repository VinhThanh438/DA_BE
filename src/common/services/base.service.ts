import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey, StatusCode } from '@common/errors';
import { filterDataExclude } from '@common/helpers/filter-data.helper';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import {
    IIdResponse,
    IPaginationInput,
    IPaginationResponse,
    IUpdateChildAction,
} from '@common/interfaces/common.interface';
import logger from '@common/logger';
import { BaseRepo } from '@common/repositories/base.repo';
import { DEFAULT_EXCLUDED_FIELDS, OrderStatus } from '@config/app.constant';
import { Prisma } from '@prisma/client';

export abstract class BaseService<T, S, W, R extends BaseRepo<T, any, W> = BaseRepo<T, any, W>> {
    protected db = DatabaseAdapter.getInstance();

    constructor(protected readonly repo: R) {}

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

    protected async isExistIncludeConditions(
        data: { [key: string]: any },
        includeSelf: boolean = false,
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        if (!data || Object.keys(data).length === 0) return;

        if (includeSelf && !data.id) {
            logger.warn(`${this.constructor.name}.${ErrorKey.EXISTED}: Missing id in update method`);
            throw new APIError({
                status: StatusCode.SERVER_ERROR,
                message: 'common.developer-error',
            });
        }

        const orConditions = Object.entries(data)
            .filter(([key, value]) => key !== 'id' && value != null)
            .map(([key, value]) => ({ [key]: value }));

        if (orConditions.length === 0) return;

        const where: any = {
            OR: orConditions,
        };

        if (includeSelf) {
            where.NOT = { id: data.id };
        }

        const existedRecord: any = await this.repo.findOne(where as W, false, tx);

        if (existedRecord) {
            const fields = Object.keys(data).filter((k) => k !== 'id');
            const existedFields = fields.filter((field) => existedRecord[field] === data[field]);
            const messages = existedFields.map((f) => `${f}.existed`);
            throw new APIError({
                status: StatusCode.BAD_REQUEST,
                message: 'common.existed',
                errors: messages,
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

    public async getAll(data: W, isDefaultSelect = false): Promise<Partial<T>[]> {
        try {
            const result = await this.repo.findMany(data as W, isDefaultSelect);
            return result;
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

    public async updateChildEntity(
        data: IUpdateChildAction,
        repo: BaseRepo<any, any, any>,
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        if (!data || (!data.add && !data.update && !data.delete)) {
            throw new APIError({
                message: `common.status.${StatusCode.BAD_REQUEST}`,
                status: ErrorCode.BAD_REQUEST,
                errors: [`request.${ErrorKey.INVALID}`],
            });
        }

        const executeOperations = async (transaction: Prisma.TransactionClient) => {
            if (Array.isArray(data.delete) && data.delete.length > 0) {
                for (const id of data.delete) {
                    const check = await repo.isExist({ id }, transaction);
                    if (!check) {
                        throw new APIError({
                            message: `common.status.${StatusCode.BAD_REQUEST}`,
                            status: ErrorCode.BAD_REQUEST,
                            errors: [`id.${ErrorKey.NOT_FOUND}`],
                        });
                    }
                }
                await repo.deleteMany({ id: { in: data.delete } }, transaction, false);
            }

            if (Array.isArray(data.add) && data.add.length > 0) {
                const filteredAdd = this.filterData(data.add, DEFAULT_EXCLUDED_FIELDS, ['key']);
                await repo.createMany(filteredAdd, transaction);
            }

            if (Array.isArray(data.update) && data.update.length > 0) {
                for (const item of data.update) {
                    const id = item.id as number;
                    if (!id) {
                        throw new APIError({
                            message: `common.status.${StatusCode.BAD_REQUEST}`,
                            status: ErrorCode.BAD_REQUEST,
                            errors: ['id.required'],
                        });
                    }

                    const exists = await repo.findOne({ id }, true, transaction);

                    if (!exists) {
                        throw new APIError({
                            message: `common.status.${StatusCode.REQUEST_NOT_FOUND}`,
                            status: ErrorCode.REQUEST_NOT_FOUND,
                            errors: ['id.not_found'],
                        });
                    }

                    const filteredUpdate = this.filterData([item], DEFAULT_EXCLUDED_FIELDS, ['key', 'id'])[0];

                    await repo.isExist({ id });

                    await repo.update({ id }, filteredUpdate, transaction);
                }
            } else {
                logger.debug('No records to update');
            }
        };

        if (tx) {
            await executeOperations(tx);
        } else {
            await this.db.$transaction(async (transaction) => {
                await executeOperations(transaction);
            });
        }
    }

    protected mapDetails<T extends Record<string, any>>(
        items: T[],
        foreignKeys: Record<string, any>,
    ): (T & Record<string, any>)[] {
        if (!items || !Array.isArray(items)) {
            return [];
        }

        return items.map((item) => ({
            ...item,
            ...foreignKeys,
        }));
    }

    protected parseJsonArray(rawFiles: any) {
        let files;
        if (Array.isArray(rawFiles)) {
            files = rawFiles;
        } else if (typeof rawFiles === 'string') {
            try {
                files = JSON.parse(rawFiles);
            } catch (e) {
                files = [];
            }
        } else if (typeof rawFiles === 'object' && rawFiles !== null) {
            files = Array.isArray(rawFiles) ? rawFiles : [rawFiles];
        }
        return files;
    }

    protected enrichTotals(responseData: IPaginationResponse): IPaginationResponse {
        const enrichedData = responseData.data.map((order: any) => {
            let total_money = 0;
            let total_vat = 0;
            let total_commission = 0;

            order.details.forEach((detail: any) => {
                const quantity = Number(detail.quantity || 0);
                const price = Number(detail.price || 0);
                const vat = Number(detail.vat || 0);
                const commission = Number(detail.commission || 0);

                const totalMoney = quantity * price;
                const totalVat = (totalMoney * vat) / 100;
                const totalCommission = (totalMoney * commission) / 100;

                total_money += totalMoney;
                total_vat += totalVat;
                total_commission += totalCommission;
            });

            const total_amount = total_money + total_vat;

            return {
                ...order,
                total_money,
                total_vat,
                total_amount,
                total_commission,
            };
        });

        return {
            ...responseData,
            data: enrichedData,
        };
    }

    public manualPaginate<T>(items: T[], page: number = 1, size: number = 20): IPaginationResponse<T> {
        const totalRecords = items.length;
        const totalPages = Math.ceil(totalRecords / size);
        const currentPage = page;
        const offset = (currentPage - 1) * size;

        const paginatedItems = items.slice(offset, offset + size);

        return {
            data: paginatedItems,
            pagination: {
                totalPages,
                totalRecords,
                size,
                currentPage,
            },
        };
    }

    async validateStatusApprove(id: number, repo: any = this.repo) {
        const entity = await repo.findOne({ id, status: OrderStatus.PENDING } as any);

        if (!entity) {
            throw new APIError({
                message: `common.status.${StatusCode.BAD_REQUEST}`,
                status: ErrorCode.BAD_REQUEST,
                errors: [`status.${ErrorKey.INVALID}`],
            });
        }

        return entity;
    }

    async canEdit(id: number, entityName: string, isAdmin: boolean, repo: any = this.repo) {
        const entity = await repo.findOne({ id, ...(!isAdmin && { status: OrderStatus.PENDING }) } as any);

        if (!entity) {
            throw new APIError({
                message: `common.status.${StatusCode.BAD_REQUEST}`,
                status: ErrorCode.BAD_REQUEST,
                errors: [`${entityName}.${ErrorKey.CANNOT_EDIT}`],
            });
        }

        return entity;
    }
}
