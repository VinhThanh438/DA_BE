import { EmployeeFinances, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';

export const EmployeeFinanceSelection: Prisma.EmployeeFinancesSelect = {
    id: true,
    name: true,
    amount: true,
    note: true,
    status: true,
    type: true,
};

export const EmployeeFinanceSelectionAll: Prisma.EmployeeFinancesSelect = {
    ...EmployeeFinanceSelection,
};

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
