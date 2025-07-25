import { WarehouseRepo } from '@common/repositories/warehouse.repo';
import { BaseService } from './base.service';
import { Warehouses, Prisma } from '.prisma/client';
import { IWarehouse } from '@common/interfaces/warehouse.interface';
import { IIdResponse } from '@common/interfaces/common.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';

export class WarehouseService extends BaseService<Warehouses, Prisma.WarehousesSelect, Prisma.WarehousesWhereInput> {
    private static instance: WarehouseService;
    private employeeRepo: EmployeeRepo = new EmployeeRepo();

    private constructor() {
        super(new WarehouseRepo());
    }

    public static getInstance(): WarehouseService {
        if (!this.instance) {
            this.instance = new WarehouseService();
        }
        return this.instance;
    }

    public async create(request: Partial<IWarehouse>): Promise<IIdResponse> {
        await this.isExist({ code: request.code });

        await this.validateForeignKeys(request, {
            employee_id: this.employeeRepo,
        });

        const createdId = await this.repo.create(request);

        return { id: createdId };
    }

    public async update(id: number, request: Partial<IWarehouse>): Promise<IIdResponse> {
        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            employee_id: this.employeeRepo,
        });

        const updatedId = await this.repo.update({ id }, request);

        return { id: updatedId };
    }
}
