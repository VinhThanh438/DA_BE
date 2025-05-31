import { TimeHelper } from '@common/helpers/time.helper';
import { transformDecimal } from '@common/helpers/transform.util';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { IPaginationInfo, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { Prisma } from '@prisma/client';

/**
 * Note:
 * @param T: Represents the Prisma model type (e.g., Something)
 * @param S: Represents the Prisma select type (e.g., Prisma.SomethingSelect)
 * @param W: Represents the Prisma WhereInput type (e.g., Prisma.SomethingWhereInput)
 */
export abstract class BaseRepo<T, S extends Record<string, any>, W> {
    // Abstract properties to be implemented by subclasses
    protected abstract db: any; // Prisma model instance (e.g., Something)
    protected abstract defaultSelect: S; // Default fields to select (e.g., SomethingSelection)
    protected abstract detailSelect: S; // Default fields to select (e.g., SomethingSelection)
    protected abstract modelKey: keyof Prisma.TransactionClient;
    protected searchableFields: string[] = [];
    protected timeFieldDefault: string = 'created_at';
    private dbAdapter = DatabaseAdapter.getInstance();

    protected getModel(tx?: Prisma.TransactionClient): any {
        return tx ? tx[this.modelKey] : this.db;
    }

    public async paginate(
        { page, size, keyword, startAt, endAt, ...args }: Partial<IPaginationInput>,
        includeRelations: boolean = false,
        query: object = {},
    ): Promise<IPaginationResponse> {
        const currentPage: number = page ? Number(page) : 1;
        const limit: number = size ? Number(size) : 10;
        const skip = (currentPage - 1) * limit;

        const where: any = {
            ...query,
            ...args,
        };

        if (startAt || endAt) {
            where[this.timeFieldDefault] = {};
            if (startAt) where[this.timeFieldDefault].gte = TimeHelper.parseStartOfDayDate(startAt);
            if (endAt) where[this.timeFieldDefault].lte = TimeHelper.parseEndOfDayDate(endAt);
        }

        if (keyword && this.searchableFields.length) {
            where.OR = this.searchableFields.map((field) => ({
                [field]: { contains: keyword, mode: 'insensitive' },
            }));
        }

        const [data, totalRecords] = await Promise.all([
            this.db.findMany({
                where: { ...where, ...(args && args) },
                select: includeRelations ? this.detailSelect : this.defaultSelect,
                skip,
                take: limit,
                orderBy: { id: 'desc' },
            }),
            this.db.count({ where: { ...where, ...(args && args) } }),
        ]);

        const totalPages = Math.ceil(totalRecords / limit);

        return {
            data: transformDecimal(data),
            pagination: {
                totalPages: totalPages,
                totalRecords: totalRecords,
                size: limit,
                currentPage: currentPage,
            } as IPaginationInfo,
        };
    }

    public async findOne(
        where: W = {} as W,
        includeRelations: boolean = false,
        tx?: Prisma.TransactionClient,
    ): Promise<Partial<T> | null> {
        const sanitizedWhere = this.sanitizeJsonFilters(where);
        const db = this.getModel(tx);

        const data = await db.findFirst({
            where: sanitizedWhere,
            select: includeRelations ? this.detailSelect : this.defaultSelect,
        });

        return transformDecimal(data);
    }

    public async getLastRecord(tx?: Prisma.TransactionClient): Promise<Partial<T> | null> {
        const db = this.getModel(tx);

        return db.findFirst({
            orderBy: {
                id: 'desc',
            },
            select: {
                id: true,
                code: true,
            },
        });
    }

    private sanitizeInOperators(obj: any): any {
        if (typeof obj !== 'object' || obj === null) return obj;

        const newObj: any = Array.isArray(obj) ? [] : {};

        for (const key in obj) {
            if (key === 'in' && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                newObj[key] = Object.values(obj[key]);
            } else {
                newObj[key] = this.sanitizeInOperators(obj[key]);
            }
        }

        return newObj;
    }

    public async findMany(
        where: W = {} as W,
        includeRelations: boolean = false,
        tx?: Prisma.TransactionClient,
    ): Promise<Partial<T>[]> {
        let sanitizedWhere = this.sanitizeJsonFilters(where);

        for (const logicKey of ['AND', 'OR', 'NOT']) {
            if (
                sanitizedWhere[logicKey] &&
                !Array.isArray(sanitizedWhere[logicKey]) &&
                typeof sanitizedWhere[logicKey] === 'object'
            ) {
                sanitizedWhere[logicKey] = Object.values(sanitizedWhere[logicKey]);
            }
        }

        sanitizedWhere = this.sanitizeInOperators(sanitizedWhere);

        const db = this.getModel(tx);
        const data = await db.findMany({
            where: sanitizedWhere,
            orderBy: { [this.timeFieldDefault]: 'desc' },
            select: includeRelations ? this.detailSelect : this.defaultSelect,
        });
        return transformDecimal(data);
    }

    public async isExist(where: W = {} as W, tx?: Prisma.TransactionClient): Promise<Partial<T> | null> {
        const sanitizedWhere = this.sanitizeJsonFilters(where);
        const db = this.getModel(tx);

        return db.findFirst({
            where: sanitizedWhere,
            select: this.defaultSelect,
        });
    }

    public async create(body: any, tx?: Prisma.TransactionClient): Promise<number> {
        const db = this.getModel(tx);
        const organizationId = body.organization_id;
        try {
            if (organizationId) {
                body.organization = { connect: { id: organizationId } };
                delete body.organization_id;
            }
            const data = await db.create({ data: body });
            return data?.id;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientValidationError) {
                if (organizationId) {
                    delete body.organization;
                    body.organization_id = organizationId;
                }
                const data = await db.create({ data: body });
                return data?.id;
            }
            throw error;
        }
    }

    public async createMany(bodies: any[], tx?: Prisma.TransactionClient): Promise<T[]> {
        let count = 0;
        let listDataItems: any[] = [];

        const db = this.getModel(tx);
        const run = async () => {
            for (const item of bodies) {
                const data = await db.create({ data: item });
                listDataItems.push(data);
                count++;
            }
        };
        if (tx) {
            await run();
        } else {
            await this.dbAdapter.$transaction(run);
        }
        return listDataItems;
    }

    public async updateManyByCondition(
        where: W = {} as W,
        body: any,
        tx?: Prisma.TransactionClient,
        needSanitized = true,
    ): Promise<void> {
        const db = this.getModel(tx);
        const sanitizedWhere = this.sanitizeJsonFilters(where);
        await db.updateMany({
            where: needSanitized ? sanitizedWhere : where,
            data: body,
        });
    }

    public async updateMany(bodies: any[], tx?: Prisma.TransactionClient): Promise<number> {
        let count = 0;
        const db = this.getModel(tx);

        const run = async () => {
            for (const item of bodies) {
                await db.update({
                    where: { id: item.id },
                    data: item,
                });
            }
        };

        if (tx) {
            await run();
        } else {
            await this.dbAdapter.$transaction(run);
        }

        return count || 0;
    }

    public async update(where: W = {} as W, body: any, tx?: Prisma.TransactionClient): Promise<number> {
        const db = this.getModel(tx);
        const data = await db.update({
            where: {
                id: (where as any).id as number,
            },
            data: body,
        });
        return data?.id;
    }

    public async delete(where: W = {} as W, tx?: Prisma.TransactionClient): Promise<number> {
        const db = this.getModel(tx);
        const data = await db.delete({
            where: {
                id: (where as any).id as number,
            },
        });
        return data?.id;
    }

    public async deleteMany(where: W = {} as W, tx?: Prisma.TransactionClient, needSanitized = true): Promise<number> {
        const sanitizedWhere = this.sanitizeJsonFilters(where);
        const db = this.getModel(tx);
        const data = await db.deleteMany({
            where: needSanitized ? sanitizedWhere : where,
        });
        return data?.id;
    }

    public async upsertChildren<TChild extends { id?: number }>(
        items: TChild[] | undefined,
        childRepo: BaseRepo<any, any, any>,
        parentField: keyof any,
        parentId: number,
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        if (!items) return;

        for (const item of items) {
            const { id, ...rest } = item;
            const whereClause: any = {
                ...(id && { id }),
                [parentField]: parentId,
            };

            const existing = id ? await childRepo.findOne(whereClause, false, tx) : null;

            if (existing) {
                await childRepo.update({ id }, item, tx);
            } else {
                await childRepo.create({ ...item, [parentField]: parentId }, tx);
            }
        }
    }

    /**
     * Sanitize fields that are of type JsonNullable or JsonNullableFilter
     * by removing empty arrays or invalid values to prevent Prisma errors.
     */
    private sanitizeJsonFilters(input: any): any {
        if (!input || typeof input !== 'object') return input;

        const sanitized: any = {};
        for (const key of Object.keys(input)) {
            const value = input[key];

            if (Array.isArray(value) && value.length === 0) {
                continue;
            } else if (value && typeof value === 'object') {
                sanitized[key] = this.sanitizeJsonFilters(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }

    public async aggregate(
        where: W,
        aggregateParams: {
            _count?: boolean | Record<string, boolean>;
            _sum?: Record<string, boolean>;
            _avg?: Record<string, boolean>;
            _min?: Record<string, boolean>;
            _max?: Record<string, boolean>;
        },
        tx?: Prisma.TransactionClient,
    ): Promise<any> {
        const model = this.getModel(tx);

        try {
            const result = await model.aggregate({
                where,
                ...aggregateParams,
            });

            return transformDecimal(result);
        } catch (error) {
            throw error;
        }
    }
}
