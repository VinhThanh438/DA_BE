import { Users, Prisma } from '.prisma/client';
import { IPaginationInfo, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';

export const UserSelectionWithoutPassword: Prisma.UsersSelect = {
    id: true,
    code: true,
    device_uid: true,
    username: true,
    email: true,
};

export const UserSelection: Prisma.UsersSelect = {
    ...UserSelectionWithoutPassword,
    password: true,
};

export const UserSelectionAll: Prisma.UsersSelect = {
    ...UserSelection,
};

export const getSelection = (includeRelations: boolean): Prisma.UsersSelect => ({
    ...UserSelection,
    ...(includeRelations ? UserSelectionAll : {}),
});

export class UserRepo {
    private static db = DatabaseAdapter.getInstance().users;
    private static SEARCHABLE_FIELDS: (keyof Prisma.UsersWhereInput)[] = ['code'];

    private static buildSearchCondition(keyword?: string): Prisma.UsersWhereInput | undefined {
        if (!keyword) return undefined;

        return {
            OR: this.SEARCHABLE_FIELDS.map((field) => ({
                [field]: { contains: keyword, mode: 'insensitive' },
            })),
        };
    }

    public static async paginate(
        { page, limit, args }: IPaginationInput,
        includeRelations: boolean = false,
    ): Promise<IPaginationResponse> {
        const currentPage = page ?? 1;
        const size = limit ?? 10;
        const skip = (currentPage - 1) * size;
        const { keyword, startAt, endAt } = args ?? {};

        const conditions: Prisma.UsersWhereInput = {
            is_deleted: false,
            ...(startAt || endAt
                ? {
                      created_at: {
                          ...(startAt && { gte: startAt }),
                          ...(endAt && { lte: endAt }),
                      },
                  }
                : {}),
        };

        if (keyword) {
            const searchCondition = this.buildSearchCondition(keyword);
            if (searchCondition) {
                conditions.OR = searchCondition.OR;
            }
        }

        const [data, totalRecords] = await Promise.all([
            this.db.findMany({
                where: conditions,
                select: getSelection(includeRelations),
                skip,
                take: size,
                orderBy: { id: 'desc' },
            }),
            this.db.count({ where: conditions }),
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

    public static async getAll(
        where: Prisma.UsersWhereInput = {},
        select?: Prisma.UsersSelect,
        includeRelations: boolean = false,
    ): Promise<Users[]> {
        return this.db.findMany({
            where: {
                ...where,
                is_deleted: false,
            },
            select: select || getSelection(includeRelations),
        });
    }

    public static async findOne(
        where: Prisma.UsersWhereInput = {},
        select?: Prisma.UsersSelect,
        includeRelations: boolean = false,
    ): Promise<Partial<Users> | null> {
        return this.db.findFirst({
            where: {
                ...where,
                is_deleted: false,
            },
            select: select || getSelection(includeRelations),
        });
    }

    public static async isExist(where: Prisma.UsersWhereInput = {}): Promise<Partial<Users> | null> {
        return this.db.findFirst({
            where: {
                ...where,
                is_deleted: false,
            },
            select: {
                id: true,
            },
        });
    }

    public static async create(data: Prisma.UsersCreateInput): Promise<Users> {
        return this.db.create({
            data,
        });
    }

    public static async delete(id: number): Promise<Partial<Users>> {
        return this.db.delete({
            where: { id },
            select: {
                id: true,
            },
        });
    }

    public static async update(
        where: Prisma.UsersWhereUniqueInput = { id: undefined },
        data: Prisma.UsersUpdateInput,
    ): Promise<Users> {
        return this.db.update({
            where: {
                ...where,
                is_deleted: false,
            },
            data,
        });
    }
}
