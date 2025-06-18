import { Prisma } from '.prisma/client';
import { CommonDetailSelectionAll } from './common-detail.select';
import { EmployeeSelection } from './employee.select';
import { PartnerSelection } from './partner.select';
import { OrderSelection, OrganizationSelection } from './base.select';

export const ContractSelection: Prisma.ContractsSelect = {
    id: true,
    code: true,
    tax: true,
    note: true,
    time_at: true,
    contract_date: true,
    status: true,
    delivery_date: true,
    files: true,
};

export const ContractSelectionAll: Prisma.ContractsSelect = {
    ...ContractSelection,
    details: {
        select: CommonDetailSelectionAll,
    },
    order: {
        select: OrderSelection,
    },
    partner: {
        select: PartnerSelection,
    },
    organization: {
        select: OrganizationSelection,
    },
    employee: {
        select: EmployeeSelection,
    },
};
