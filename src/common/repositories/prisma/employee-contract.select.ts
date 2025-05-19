import { Prisma } from '.prisma/client';

export const EmployeeContractSelection: Prisma.EmployeeContractsSelect = {
    id: true,
    code: true,
    type: true,
    salary: true,
    start_date: true,
    end_date: true,
    is_applied: true,
    file: true,
};

export const EmployeeContractSelectionAll: Prisma.EmployeeContractsSelect = {
    ...EmployeeContractSelection,
};
