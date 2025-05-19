import { Prisma } from '.prisma/client';
import { EmployeeSelection } from './employee.select';

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
        select: EmployeeSelection,
    },
};
