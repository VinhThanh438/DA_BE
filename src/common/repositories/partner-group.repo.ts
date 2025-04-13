import { PartnerGroups, Prisma } from '.prisma/client';
import { IPaginationInfo, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';

export const PartnerGroupSelection: Prisma.PartnerGroupsSelect = {
    id: true,
    name: true
}

export class PartnerGroupRepo {
    private static db = DatabaseAdapter.getInstance().partnerGroups;

    public static async paginate(
        { page, limit, args }: IPaginationInput,
        includeRelations: boolean = false,
    ): Promise<IPaginationResponse> {
        const currentPage = page ?? 1;
        const size = limit ?? 10;
        const skip = (currentPage - 1) * size;

        const [data, totalRecords] = await Promise.all([
            this.db.findMany({
                select: PartnerGroupSelection,
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
        where: Prisma.PartnerGroupsWhereInput = {},
        includeRelations: boolean = false,
    ): Promise<Partial<PartnerGroups> | null> {
        return this.db.findFirst({
            where: {
                ...where,
            },
            select: PartnerGroupSelection,
        });
    }

    public static async isExist(where: Prisma.PartnerGroupsWhereInput = {}): Promise<Partial<PartnerGroups> | null> {
        return this.db.findFirst({
            where: {
                ...where,
            },
            select: PartnerGroupSelection,
        });
    }

    public static async create(body: Prisma.PartnerGroupsCreateInput): Promise<number> {
        const data = await this.db.create({
            data: {
                name: body.name,
            },
        });
        return data?.id;
    }

    public static async update(
        where: Prisma.PartnerGroupsWhereInput = {},
        body: Prisma.PartnerGroupsCreateInput,
    ): Promise<number> {
        const data = await this.db.update({
            where: {
                id: where.id as number,
            },
            data: body,
        });
        return data?.id;
    }

    public static async delete(where: Prisma.PartnerGroupsWhereInput = {}): Promise<number> {
        const data = await this.db.delete({
            where: {
                id: where.id as number,
            },
        });
        return data?.id;
    }
}
