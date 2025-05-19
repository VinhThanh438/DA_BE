import { Users, Prisma } from '.prisma/client';
import { IPaginationInfo, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { ADMIN_USER_NAME } from '@common/environment';
import { UserSelectionWithoutPassword, UserSelectionAll, UserSelection } from './prisma/user.select';

export class UserRepo extends BaseRepo<Users, Prisma.UsersSelect, Prisma.UsersWhereInput> {
    protected db = DatabaseAdapter.getInstance().users;
    protected defaultSelect = UserSelectionWithoutPassword;
    protected detailSelect = UserSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'users';

    private static SEARCHABLE_FIELDS: (keyof Prisma.UsersWhereInput)[] = ['code', 'username', 'email'];

    private static buildSearchCondition(keyword?: string): Prisma.UsersWhereInput | undefined {
        if (!keyword) return undefined;

        return {
            OR: this.SEARCHABLE_FIELDS.map((field) => ({
                [field]: { contains: keyword, mode: 'insensitive' },
            })),
        };
    }

    public async paginate(
        { page, size, args }: IPaginationInput,
        includeRelations: boolean = false,
    ): Promise<IPaginationResponse> {
        const currentPage = page ?? 1;
        const limit = size ?? 10;
        const skip = (currentPage - 1) * limit;
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
            NOT: {
                username: ADMIN_USER_NAME,
            },
        };

        if (keyword) {
            const searchCondition = UserRepo.buildSearchCondition(keyword);
            if (searchCondition) {
                conditions.OR = searchCondition.OR;
            }
        }

        const [data, totalRecords] = await Promise.all([
            this.db.findMany({
                where: conditions,
                select: includeRelations ? this.detailSelect : this.defaultSelect,
                skip,
                take: size,
                orderBy: { id: 'desc' },
            }),
            this.db.count({ where: conditions }),
        ]);

        const totalPages = Math.ceil(totalRecords / limit);

        return {
            data: data,
            pagination: {
                totalPages: totalPages,
                totalRecords: totalRecords,
                size: limit,
                currentPage: currentPage,
            } as IPaginationInfo,
        };
    }

    public async isExist(where: Prisma.UsersWhereInput = {}): Promise<Partial<Users> | null> {
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

    public async getDetailInfo(where: Prisma.UsersWhereInput = {}): Promise<Partial<Users> | null> {
        return this.db.findFirst({
            where: {
                ...where,
                is_deleted: false,
            },
            select: UserSelection,
        });
    }
}
