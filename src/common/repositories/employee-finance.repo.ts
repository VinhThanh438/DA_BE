import { EmployeeFinances, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EmployeeFinanceSelection, EmployeeFinanceSelectionAll } from './prisma/employee-finance.select';

export class EmployeeFinanceRepo extends BaseRepo<
    EmployeeFinances,
    Prisma.EmployeeFinancesSelect,
    Prisma.EmployeeFinancesWhereInput
> {
    protected db = DatabaseAdapter.getInstance().employeeFinances;
    protected defaultSelect = EmployeeFinanceSelection;
    protected detailSelect = EmployeeFinanceSelectionAll;
    protected modelKey = 'employeeFinances' as const;
}
