import { EmployeeContracts, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EmployeeContractSelection, EmployeeContractSelectionAll } from './prisma/prisma.select';

export class EmployeeContractRepo extends BaseRepo<
    EmployeeContracts,
    Prisma.EmployeeContractsSelect,
    Prisma.EmployeeContractsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().employeeContracts;
    protected defaultSelect = EmployeeContractSelection;
    protected detailSelect = EmployeeContractSelectionAll;
    protected modelKey = 'employeeContracts' as const;
}
