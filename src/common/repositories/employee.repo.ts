import { Employees, Prisma } from '.prisma/client';
import { IPaginationInfo, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { mapNestedInput } from '@common/helpers/nested-input.helper';
import { ICreateEmployee } from '@common/interfaces/employee.interface';
import { BaseRepo } from './base.repo';
import { EducationSelectionAll } from './education.repo';
import { EmployeeFinanceSelectionAll } from './employee-finance.repo';
import { AddressSelectionAll } from './address.repo';
import { EmergencyContactSelectionAll } from './emergency-contact.repo';
import { EmployeeContractSelectionAll } from './employee-contract.repo';
import { InsuranceSelectionAll } from './insurance.repo';
import { JobPositionSelectionAll } from './job-position.repo';
import { ADMIN_USER_NAME } from '@common/environment';
import { transformDecimal } from '@common/helpers/transform.util';

export const EmployeeShortSelection: Prisma.EmployeesSelect = {
    id: true,
    code: true,
    email: true,
    name: true,
    gender: true,
};

export const EmployeeSelection: Prisma.EmployeesSelect = {
    ...EmployeeShortSelection,
    marital_status: true,
    working_status: true,
    employee_status: true,
    date_of_birth: true,
    phone: true,
    tax: true,
    ethnicity: true,
    religion: true,
    attendance_code: true,
    description: true,
    avatar: true,
    job_position: {
        select: JobPositionSelectionAll,
    },
};

export const EmployeeSelectionAll: Prisma.EmployeesSelect = {
    ...EmployeeSelection,
    identity_code: true,
    identity_issued_place: true,
    identity_issued_date: true,
    identity_expired_date: true,
    indentity_files: true,

    passport_code: true,
    passport_issued_place: true,
    passport_issued_date: true,
    passport_expired_date: true,
    passport_files: true,
    trial_date: true,
    official_date: true,
    educations: {
        select: EducationSelectionAll,
    },
    employee_finances: {
        select: EmployeeFinanceSelectionAll,
    },
    addresses: {
        select: AddressSelectionAll,
    },
    emergency_contacts: {
        select: EmergencyContactSelectionAll,
    },
    employee_contracts: {
        select: EmployeeContractSelectionAll,
    },
    insurances: {
        select: InsuranceSelectionAll,
    },
};

export const getSelection = (includeRelations: boolean): Prisma.EmployeesSelect => ({
    ...EmployeeSelection,
    ...(includeRelations ? EmployeeSelectionAll : {}),
});

export class EmployeeRepo extends BaseRepo<Employees, Prisma.EmployeesSelect, Prisma.EmployeesWhereInput> {
    protected db = DatabaseAdapter.getInstance().employees;
    protected defaultSelect = EmployeeSelection;
    protected detailSelect = EmployeeSelectionAll;
    protected modelKey = 'employees' as const;

    private SEARCHABLE_FIELDS: (keyof Prisma.EmployeesWhereInput)[] = ['code', 'email', 'description'];

    private buildSearchCondition(keyword?: string): Prisma.EmployeesWhereInput | undefined {
        if (!keyword) return undefined;

        return {
            OR: this.SEARCHABLE_FIELDS.map((field) => ({
                [field]: { contains: keyword, mode: 'insensitive' },
            })),
        };
    }

    public async paginate(
        { page, limit, args, isCreateUser }: IPaginationInput,
        includeRelations: boolean = false,
    ): Promise<IPaginationResponse> {
        const currentPage = page ?? 1;
        const size = limit ?? 10;
        const skip = (currentPage - 1) * size;
        const { keyword, startAt, endAt } = args ?? {};

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
            data: transformDecimal(data),
            pagination: {
                totalPages: totalPages,
                totalRecords: totalRecords,
                size,
                currentPage: currentPage,
            } as IPaginationInfo,
        };
    }

    public async getAll(
        where: Prisma.EmployeesWhereInput = {},
        includeRelations: boolean = false,
    ): Promise<Employees[]> {
        const data = await this.db.findMany({
            where: {
                ...where,
                is_deleted: false,
            },
            select: getSelection(includeRelations),
        });
        return transformDecimal(data)
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
        return transformDecimal(data)
    }

    public async isExist(where: Prisma.EmployeesWhereInput = {}): Promise<Partial<Employees> | null> {
        const data = await this.db.findFirst({
            where: {
                ...where,
                is_deleted: false,
            },
            select: {
                id: true,
            },
        });
        return transformDecimal(data)
    }

    public async create(data: ICreateEmployee): Promise<number> {
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

        const result = await this.db.create({
            data: {
                ...rest,
                ...(job_position_id && {
                    job_position: {
                        connect: { id: job_position_id },
                    },
                }) as any,
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
