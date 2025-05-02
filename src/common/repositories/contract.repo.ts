import { Contracts, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { CommonDetailSelection } from './common-detail.repo';
import { PartnerSelection } from './partner.repo';
import { OrganizationSelection } from './organization.repo';
import { EmployeeSelection } from './employee.repo';

export const ContractSelection: Prisma.ContractsSelect = {
    id: true,
    code: true,
    tax: true,
    sign_date: true,
    contract_value: true,
    contract_date: true,
    status: true,
    delivery_date: true,
    files: true,
};

export const ContractSelectionAll: Prisma.ContractsSelect = {
    ...ContractSelection,
    contract_details: {
        select: CommonDetailSelection
    },
    partner: {
        select: PartnerSelection
    },
    organization: {
        select: OrganizationSelection
    },
    employee: {
        select: EmployeeSelection
    }
};

export class ContractRepo extends BaseRepo<
    Contracts,
    Prisma.ContractsSelect,
    Prisma.ContractsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().contracts;
    protected defaultSelect = ContractSelection;
    protected detailSelect = ContractSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'contracts';
}
