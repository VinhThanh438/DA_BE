import { Prisma } from '.prisma/client';

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
