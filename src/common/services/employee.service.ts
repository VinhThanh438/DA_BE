import { Employees, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { IEmployee, IUpdateEmployee } from '@common/interfaces/employee.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { JobPositionRepo } from '@common/repositories/job-position.repo';
import { BaseService } from './base.service';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { DEFAULT_EXCLUDED_FIELDS } from '@config/app.constant';
import { EmployeeContractRepo } from '@common/repositories/employee-contract.repo';
import { EmployeeFinanceRepo } from '@common/repositories/employee-finance.repo';

export class EmployeeService extends BaseService<Employees, Prisma.EmployeesSelect, Prisma.EmployeesWhereInput> {
    private static instance: EmployeeService;
    private jobPositionRepo = new JobPositionRepo();
    private organizationRepo = new OrganizationRepo();
    private employeeContractRepo = new EmployeeContractRepo();
    private employeeFinanceRepo = new EmployeeFinanceRepo();

    private constructor() {
        super(new EmployeeRepo());
    }

    public static getInstance(): EmployeeService {
        if (!this.instance) {
            this.instance = new EmployeeService();
        }
        return this.instance;
    }

    public async updateEmployee(id: number, request: IUpdateEmployee): Promise<IIdResponse> {
        await this.findById(id);

        await this.isExistIncludeConditions(
            {
                code: request.code,
                attendance_code: request.attendance_code,
                identity_code: request.identity_code,
                passport_code: request.passport_code,
                id,
            },
            true,
        );

        await this.validateForeignKeys(request, {
            organization_id: this.organizationRepo,
            job_position_id: this.jobPositionRepo,
        });

        const {
            employee_contracts_add = [],
            employee_contracts_update = [],
            employee_contracts_delete = [],
            employee_finances_add = [],
            employee_finances_update = [],
            employee_finances_delete = [],
            ...body
        } = request;

        if (employee_finances_add.length > 0) {
            employee_finances_add.forEach((item) => {
                Object.assign(item, { employee: { connect: { id } } });
            });
        }

        if (employee_contracts_add.length > 0) {
            employee_contracts_add.forEach((item) => {
                Object.assign(item, { employee: { connect: { id } } });
            });
        }

        await this.db.$transaction(async (tx) => {
            await this.updateChildEntity(
                { add: employee_finances_add, update: employee_finances_update, delete: employee_finances_delete },
                this.employeeFinanceRepo,
                tx,
            );

            await this.updateChildEntity(
                { add: employee_contracts_add, update: employee_contracts_update, delete: employee_contracts_delete },
                this.employeeContractRepo,
                tx,
            );

            await this.repo.update({ id }, body, tx);
        });

        return { id };
    }

    public async create(request: Partial<IEmployee>): Promise<IIdResponse> {
        await this.isExist({
            code: request.code,
            attendance_code: request.attendance_code,
            identity_code: request.identity_code,
            passport_code: request.passport_code,
        });

        await this.validateForeignKeys(request, {
            organization_id: this.organizationRepo,
            job_position_id: this.jobPositionRepo,
        });

        if (request.employee_contracts && request.employee_contracts.length > 0) {
            request.employee_contracts = this.filterData(request.employee_contracts, DEFAULT_EXCLUDED_FIELDS, [
                'employee_contracts',
            ]);
        }

        if (request.employee_finances && request.employee_finances.length > 0) {
            request.employee_finances = this.filterData(request.employee_finances, DEFAULT_EXCLUDED_FIELDS, [
                'employee_finances',
            ]);
        }

        if (request.insurances && request.insurances.length > 0) {
            request.insurances = this.filterData(request.insurances, DEFAULT_EXCLUDED_FIELDS, ['insurances']);
        }

        if (request.addresses && request.addresses.length > 0) {
            request.addresses = this.filterData(request.addresses, DEFAULT_EXCLUDED_FIELDS, ['addresses']);
        }

        const data = await this.repo.create(request);

        return { id: data };
    }
}
