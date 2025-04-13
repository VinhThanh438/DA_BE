import { Levels, Prisma } from '.prisma/client';
import { IPaginationInfo, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';

export const LevelSelection: Prisma.LevelsSelect = {
    id: true,
    name: true
}

export class LevelRepo {
    private static db = DatabaseAdapter.getInstance().levels;

    public static async paginate(
        { page, limit, args }: IPaginationInput,
        includeRelations: boolean = false,
    ): Promise<IPaginationResponse> {
        const currentPage = page ?? 1;
        const size = limit ?? 10;
        const skip = (currentPage - 1) * size;

        const [data, totalRecords] = await Promise.all([
            this.db.findMany({
                select: LevelSelection,
                skip,
                take: size,
                orderBy: { id: 'desc' },
            }),
            this.db.count(),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        return {
            data: data,
            pagination: {
                total_pages: totalPages,
                total_records: totalRecords,
                size,
                current_page: currentPage,
            } as IPaginationInfo,
        };
    }

    public static async findOne(
        where: Prisma.LevelsWhereInput = {},
        includeRelations: boolean = false,
    ): Promise<Partial<Levels> | null> {
        return this.db.findFirst({
            where: {
                ...where,
            },
            select: LevelSelection,
        });
    }

    public static async isExist(where: Prisma.LevelsWhereInput = {}): Promise<Partial<Levels> | null> {
        return this.db.findFirst({
            where: {
                ...where,
            },
            select: LevelSelection,
        });
    }

    public static async create(body: Prisma.LevelsCreateInput): Promise<number> {
        const data = await this.db.create({
            data: {
                name: body.name,
            },
        });
        return data?.id;
    }

    public static async update(where: Prisma.LevelsWhereInput = {}, body: Prisma.LevelsCreateInput): Promise<number> {
        const data = await this.db.update({
            where: {
                id: where.id as number,
            },
            data: body,
        });
        return data?.id;
    }

    public static async delete(where: Prisma.LevelsWhereInput = {}): Promise<number> {
        const data = await this.db.delete({
            where: {
                id: where.id as number,
            }
        });
        return data?.id;
    }
}
