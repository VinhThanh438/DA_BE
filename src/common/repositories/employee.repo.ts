import { Employees, Prisma } from '.prisma/client';
import { IPaginationInfo, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { mapNestedInput } from '@common/helpers/nested-input.helper';
import { IEmployee } from '@common/interfaces/employee.interface';
import { BaseRepo } from './base.repo';
import { ADMIN_USER_NAME } from '@common/environment';
import { transformDecimal } from '@common/helpers/transform.util';
import { EmployeeSelection, EmployeeSelectionAll } from './prisma/employee.select';

export const getSelection = (includeRelations: boolean): Prisma.EmployeesSelect => ({
    ...EmployeeSelection,
    ...(includeRelations ? EmployeeSelectionAll : {}),
});

export class EmployeeRepo extends BaseRepo<Employees, Prisma.EmployeesSelect, Prisma.EmployeesWhereInput> {
    protected db = DatabaseAdapter.getInstance().employees;
    protected defaultSelect = EmployeeSelection;
    protected detailSelect = EmployeeSelectionAll;
    protected modelKey = 'employees' as const;

    private SEARCHABLE_FIELDS: (keyof Prisma.EmployeesWhereInput)[] = ['code', 'email', 'name'];

    private buildSearchCondition(keyword?: string): Prisma.EmployeesWhereInput | undefined {
        if (!keyword) return undefined;

        return {
            OR: this.SEARCHABLE_FIELDS.map((field) => ({
                [field]: { contains: keyword, mode: 'insensitive' },
            })),
        };
    }

    public async paginate(
        { page, size, isCreateUser, ...args }: IPaginationInput,
        includeRelations: boolean = false,
    ): Promise<IPaginationResponse> {
        const currentPage = page ?? 1;
        const limit = size ?? 10;
        const skip = (currentPage - 1) * limit;
        const { keyword, startAt, endAt, organization_id } = args ?? {};

        const conditions: Prisma.EmployeesWhereInput = {
            ...(startAt || endAt
                ? {
                      created_at: {
                          ...(startAt && { gte: startAt }),
                          ...(endAt && { lte: endAt }),
                      },
                  }
                : {}),
            ...(isCreateUser ? { has_user_account: false } : {}),
            NOT: {
                name: ADMIN_USER_NAME,
            },
            organization_id,
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
                take: limit,
                orderBy: { id: 'desc' },
            }),
            this.db.count({ where: conditions }),
        ]);

        const totalPages = Math.ceil(totalRecords / limit);

        data.forEach((item) => {
            if (item.employee_finances) {
                item.employee_finances = transformDecimal(item.employee_finances);
            }
        });
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

    public async getAll(
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

    public async findOne(
        where: Prisma.EmployeesWhereInput = {},
        includeRelations: boolean = false,
    ): Promise<Partial<Employees> | null> {
        const data = await this.db.findFirst({
            where: {
                ...where,
                is_deleted: false,
            },
            select: getSelection(includeRelations),
        });

        return transformDecimal(data);
    }

    public async isExist(where: Prisma.EmployeesWhereInput = {}): Promise<Partial<Employees> | null> {
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

    public async create(data: IEmployee): Promise<number> {
        const {
            job_position_id,
            educations,
            employee_finances,
            addresses,
            emergency_contacts,
            employee_contracts,
            insurances,
            ...rest
        } = data;

        if (rest.organization_id) {
            rest.organization = { connect: { id: rest.organization_id } } as any;
            delete rest.organization_id;
        }

        const result = await this.db.create({
            data: {
                ...rest,
                ...((job_position_id && {
                    job_position: {
                        connect: { id: job_position_id },
                    },
                }) as any),
                educations: mapNestedInput(educations),
                employee_finances: mapNestedInput(employee_finances),
                addresses: mapNestedInput(addresses),
                emergency_contacts: mapNestedInput(emergency_contacts),
                employee_contracts: mapNestedInput(employee_contracts),
                insurances: mapNestedInput(insurances),
            },
            include: {
                educations: true,
                addresses: true,
                emergency_contacts: true,
                insurances: true,
                employee_finances: true,
                employee_contracts: true,
            },
        });

        return result.id;
    }

    public async delete(where: Prisma.EmployeesWhereInput): Promise<number> {
        const result = await this.db.deleteMany({
            where,
        });
        return result.count;
    }

    public async update(where: Prisma.EmployeesWhereInput, data: any): Promise<number> {
        const {
            educations,
            employee_finances,
            addresses,
            emergency_contacts,
            insurances,
            employee_contracts,
            job_position_id,
            ...employeeData
        } = data;

        const result = await this.db.update({
            where: {
                id: where.id as number,
                is_deleted: false,
            },
            data: {
                ...employeeData,
                ...(educations && {
                    educations: {
                        deleteMany: {},
                        create: educations,
                    },
                }),
                ...(employee_finances && {
                    employee_finances: {
                        deleteMany: {},
                        create: employee_finances,
                    },
                }),
                ...(addresses && {
                    addresses: {
                        deleteMany: {},
                        create: addresses,
                    },
                }),
                ...(emergency_contacts && {
                    emergency_contacts: {
                        deleteMany: {},
                        create: emergency_contacts,
                    },
                }),
                ...(insurances && {
                    insurances: {
                        deleteMany: {},
                        create: insurances,
                    },
                }),
                ...(employee_contracts && {
                    employee_contracts: {
                        deleteMany: {},
                        create: employee_contracts,
                    },
                }),
                ...((job_position_id && {
                    job_position: {
                        connect: { id: job_position_id },
                    },
                }) as any),
            },
        });

        return result.id;
    }
}
