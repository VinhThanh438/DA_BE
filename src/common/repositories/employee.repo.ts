import { Employees, Prisma } from '.prisma/client';
import { IPaginationInfo, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { mapNestedInput } from '@common/helpers/nested-prisma-input.helper';
import { ICreateEmployee } from '@common/interfaces/employee.interface';

export const EmployeeSelection: Prisma.EmployeesSelect = {
    id: true,
    code: true,
    email: true,
    name: true,
    age: true,
    phone: true,
    description: true,
    avatar: true,
};

export const EmployeeSelectionAll: Prisma.EmployeesSelect = {
    ...EmployeeSelection,
    education: true,
    employee_finance: true,
    address: true,
    emergency_contact: true,
    employee_contract: true,
    BankAccounts: true,
    social_insurance: true,
};

export const getSelection = (includeRelations: boolean): Prisma.EmployeesSelect => ({
    ...EmployeeSelection,
    ...(includeRelations ? EmployeeSelectionAll : {}),
});

export class EmployeeRepo {
    private static db = DatabaseAdapter.getInstance().employees;

    private static SEARCHABLE_FIELDS: (keyof Prisma.EmployeesWhereInput)[] = ['code', 'email', 'description'];

    private static buildSearchCondition(keyword?: string): Prisma.EmployeesWhereInput | undefined {
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

        const conditions: Prisma.EmployeesWhereInput = {
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
        where: Prisma.EmployeesWhereInput = {},
        includeRelations: boolean = false,
    ): Promise<Employees[]> {
        return this.db.findMany({
            where: {
                ...where,
                is_deleted: false,
            },
            select: getSelection(includeRelations),
        });
    }

    public static async findOne(
        where: Prisma.EmployeesWhereInput = {},
        includeRelations: boolean = false,
    ): Promise<Partial<Employees> | null> {
        return this.db.findFirst({
            where: {
                ...where,
                is_deleted: false,
            },
            select: getSelection(includeRelations),
        });
    }

    public static async isExist(where: Prisma.EmployeesWhereInput = {}): Promise<Partial<Employees> | null> {
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

    public static async create(data: ICreateEmployee): Promise<Employees> {
        return this.db.create({
            data: {
                ...data,

                education: mapNestedInput(data.education),
                employee_finance: mapNestedInput(data.finance),
                address: mapNestedInput(data.address),
                emergency_contact: mapNestedInput(data.emergency_contact),
                employee_contract: mapNestedInput(data.contract),
                social_insurance: mapNestedInput(data.social_insurance),
            },
            include: {
                education: true,
                address: true,
                emergency_contact: true,
                social_insurance: true,
            },
        });
    }

    public static async delete(id: number): Promise<Partial<Employees>> {
        return this.db.delete({
            where: { id },
            select: {
                id: true,
            },
        });
    }

    public static async update(
        where: Prisma.EmployeesWhereUniqueInput,
        data: ICreateEmployee,
    ): Promise<Partial<Employees>> {
        return this.db.update({
            where: {
                ...where,
                is_deleted: false,
            },
            data: {
                ...data,
                education: mapNestedInput(data.education),
                employee_finance: mapNestedInput(data.finance),
                address: mapNestedInput(data.address),
                emergency_contact: mapNestedInput(data.emergency_contact),
                employee_contract: mapNestedInput(data.contract),
                social_insurance: mapNestedInput(data.social_insurance),
            },
            select: {
                id: true,
            },
        });
    }
}
