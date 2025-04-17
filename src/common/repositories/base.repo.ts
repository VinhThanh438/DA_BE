import { IPaginationInfo, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { log } from 'node:console';

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

    public async paginate(
        { page, limit, args }: IPaginationInput,
        includeRelations: boolean = false,
        query: object = {},
    ): Promise<IPaginationResponse> {
        const currentPage = Number(page) ?? 1;
        const size = Number(limit) ?? 10;
        const skip = (currentPage - 1) * size;

        const [data, totalRecords] = await Promise.all([
            this.db.findMany({
                where: query,
                select: includeRelations ? this.detailSelect : this.defaultSelect,
                skip,
                take: size,
                orderBy: { id: 'desc' },
                ...(args && { where: args as W }), // Apply optional where conditions
            }),
            this.db.count({ where: { ...(args as W), ...query } }),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        return {
            data,
            pagination: {
                total_pages: totalPages,
                total_records: totalRecords,
                size,
                current_page: currentPage,
            } as IPaginationInfo,
        };
    }

    public async findOne(where: W = {} as W, includeRelations: boolean = false): Promise<Partial<T> | null> {
        return this.db.findFirst({
            where,
            select: includeRelations ? this.detailSelect : this.defaultSelect,
        });
    }

    public async getLastRecord(): Promise<Partial<T> | null> {
        return this.db.findFirst({
            orderBy: {
                id: 'desc',
            },
            select: {
                id: true,
                code: true,
            },
        });
    }

    public async findMany(where: W = {} as W, includeRelations: boolean = false): Promise<Partial<T> | null> {
        return this.db.findMany({
            where,
            select: includeRelations ? this.detailSelect : this.defaultSelect,
        });
    }

    public async isExist(where: W = {} as W): Promise<Partial<T> | null> {
        return this.db.findFirst({
            where,
            select: this.defaultSelect,
        });
    }

    public async create(body: any): Promise<number> {
        const data = await this.db.create({
            data: body,
        });
        return data?.id;
    }

    public async update(where: W = {} as W, body: any): Promise<number> {
        const data = await this.db.update({
            where: {
                id: (where as any).id as number,
            },
            data: body,
        });
        return data?.id;
    }

    public async delete(where: W = {} as W): Promise<number> {
        const data = await this.db.delete({
            where: {
                id: (where as any).id as number,
            },
        });
        return data?.id;
    }
}
