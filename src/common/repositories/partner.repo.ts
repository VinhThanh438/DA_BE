import { Partners, Prisma } from '.prisma/client';
import { IPaginationInfo, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';

export const PartnerSelection: Prisma.PartnersSelect = {
    id: true,
    name: true,
    type: true,
    
}

export class PartnerRepo {
    private static db = DatabaseAdapter.getInstance().partners;

    public static async paginate(
        { page, limit, args }: IPaginationInput,
        includeRelations: boolean = false,
    ): Promise<IPaginationResponse> {
        const currentPage = page ?? 1;
        const size = limit ?? 10;
        const skip = (currentPage - 1) * size;

        const [data, totalRecords] = await Promise.all([
            this.db.findMany({
                select: PartnerSelection,
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
        where: Prisma.PartnersWhereInput = {},
        includeRelations: boolean = false,
    ): Promise<Partial<Partners> | null> {
        return this.db.findFirst({
            where: {
                ...where,
            },
            select: PartnerSelection,
        });
    }

    public static async isExist(where: Prisma.PartnersWhereInput = {}): Promise<Partial<Partners> | null> {
        return this.db.findFirst({
            where: {
                ...where,
            },
            select: PartnerSelection,
        });
    }

    public static async create(body: Prisma.PartnersCreateInput): Promise<number> {
        const data = await this.db.create({
            data: {
                name: body.name,
                type: body.type,
            },
        });
        return data?.id;
    }

    public static async update(
        where: Prisma.PartnersWhereInput = {},
        body: Prisma.PartnersCreateInput,
    ): Promise<number> {
        const data = await this.db.update({
            where: {
                id: where.id as number,
            },
            data: body,
        });
        return data?.id;
    }

    public static async delete(where: Prisma.PartnersWhereInput = {}): Promise<number> {
        const data = await this.db.delete({
            where: {
                id: where.id as number,
            },
        });
        return data?.id;
    }
}
