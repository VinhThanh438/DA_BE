import { JobTitles, Prisma } from '.prisma/client';
import { IPaginationInfo, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';

export const JobTitleSelection: Prisma.JobTitlesSelect = {
    id: true,
    name: true
}

export class JobTitleRepo {
    private static db = DatabaseAdapter.getInstance().jobTitles;

    public static async paginate(
        { page, limit, args }: IPaginationInput,
        includeRelations: boolean = false,
    ): Promise<IPaginationResponse> {
        const currentPage = page ?? 1;
        const size = limit ?? 10;
        const skip = (currentPage - 1) * size;

        const [data, totalRecords] = await Promise.all([
            this.db.findMany({
                select: JobTitleSelection,
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
        where: Prisma.JobTitlesWhereInput = {},
        includeRelations: boolean = false,
    ): Promise<Partial<JobTitles> | null> {
        return this.db.findFirst({
            where: {
                ...where,
            },
            select: JobTitleSelection,
        });
    }

    public static async isExist(where: Prisma.JobTitlesWhereInput = {}): Promise<Partial<JobTitles> | null> {
        return this.db.findFirst({
            where: {
                ...where,
            },
            select: JobTitleSelection,
        });
    }

    public static async create(body: Prisma.JobTitlesCreateInput): Promise<number> {
        const data = await this.db.create({
            data: {
                name: body.name,
            },
        });
        return data?.id;
    }

    public static async update(
        where: Prisma.JobTitlesWhereInput = {},
        body: Prisma.JobTitlesCreateInput,
    ): Promise<number> {
        const data = await this.db.update({
            where: {
                id: where.id as number,
            },
            data: body,
        });
        return data?.id;
    }

    public static async delete(where: Prisma.JobTitlesWhereInput = {}): Promise<number> {
        const data = await this.db.delete({
            where: {
                id: where.id as number,
            },
        });
        return data?.id;
    }
}
