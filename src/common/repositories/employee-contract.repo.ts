import { EmployeeContracts, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';

export const EmployeeContractSelection: Prisma.EmployeeContractsSelect = {
    id: true,
    code: true,
    type: true,
    salary: true,
    start_date: true,
    end_date: true,
    is_applied: true
};

export const EmployeeContractSelectionAll: Prisma.EmployeeContractsSelect = {
    ...EmployeeContractSelection,
};

export class EmployeeContractRepo extends BaseRepo<
    EmployeeContracts,
    Prisma.EmployeeContractsSelect,
    Prisma.EmployeeContractsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().employeeContracts;
    protected defaultSelect = EmployeeContractSelection;
    protected detailSelect = EmployeeContractSelectionAll;
    protected modelKey = 'employeeContracts' as const;
}