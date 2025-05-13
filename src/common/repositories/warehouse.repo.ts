import { Warehouses, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EmployeeSelection } from './employee.repo';

export const WarehouseSelection: Prisma.WarehousesSelect = {
    id: true,
    code: true,
    name: true,
    phone: true,
    address: true,
    note: true,
};

export const WarehouseSelectionAll: Prisma.WarehousesSelect = {
    ...WarehouseSelection,
    employee: {
        select: EmployeeSelection
    }
};

export class WarehouseRepo extends BaseRepo<Warehouses, Prisma.WarehousesSelect, Prisma.WarehousesWhereInput> {
    protected db = DatabaseAdapter.getInstance().warehouses;
    protected defaultSelect = WarehouseSelection;
    protected detailSelect = WarehouseSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'warehouses';
    protected searchableFields = ['name', 'code', 'note', 'phone'];
}
