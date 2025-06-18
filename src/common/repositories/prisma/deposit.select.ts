import { Prisma } from '@prisma/client/default';
import { BankSelection } from './bank.select';
import { OrganizationSelection } from './base.select';
import { EmployeeSelection } from './employee.select';

export const DepositSelection: Prisma.DepositsSelect = {
    id: true,
    account_number: true,
    time_at: true,
    deposit_date: true,
    withdraw_date: true,
    term: true,
    amount: true,
    unit: true,
    interest_rate: true,
    compound_interest: true,
    files: true,
    note: true,
    status: true,
    rejected_reason: true,
    created_at: true,
    updated_at: true,
    bank_id: true,
    employee_id: true,
    organization_id: true,
};

export const DepositSelectionAll: Prisma.DepositsSelect = {
    ...DepositSelection,
    bank: {
        select: BankSelection,
    },
    organization: {
        select: OrganizationSelection,
    },
    employee: {
        select: EmployeeSelection,
    },
};
