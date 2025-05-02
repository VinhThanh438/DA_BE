import { Employees, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { ICreateEmployee } from '@common/interfaces/employee.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { JobPositionRepo } from '@common/repositories/job-position.repo';
import { BaseService } from './base.service';
import { OrganizationRepo } from '@common/repositories/organization.repo';

export class EmployeeService extends BaseService<Employees, Prisma.EmployeesSelect, Prisma.EmployeesWhereInput> {
    private static instance: EmployeeService;
    private jobPositionRepo = new JobPositionRepo();
    private organizationRepo = new OrganizationRepo();

    private constructor() {
        super(new EmployeeRepo());
    }

    public static getInstance(): EmployeeService {
        if (!this.instance) {
            this.instance = new EmployeeService();
        }
        return this.instance;
    }

    public async updateEmployee(id: number, request: ICreateEmployee): Promise<IIdResponse> {
        await this.findById(id)

        await this.isExist({
            code: request.code,
            attendance_code: request.attendance_code,
            identity_code: request.identity_code,
            passport_code: request.passport_code,
            id
        }, true);

        await this.validateForeignKeys(request, {
            organization_id: this.organizationRepo,
            job_position_id: this.jobPositionRepo,
        });
        
        await this.repo.create(request);

        return { id };
    }

    public async createEmployee(request: Partial<ICreateEmployee>): Promise<IIdResponse> {
        await this.isExist({
            code: request.code,
            attendance_code: request.attendance_code,
            identity_code: request.identity_code,
            passport_code: request.passport_code,
        });

        await this.validateForeignKeys(request, {
            organization_id: this.organizationRepo,
            job_position_id: this.jobPositionRepo
        })

        const data = await this.repo.create(request);

        return { id: data };
    }
}
