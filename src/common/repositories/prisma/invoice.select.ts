import { Prisma } from '.prisma/client';
import { BankSelection } from './bank.select';
import { CommonDetailSelectionAll } from './common-detail.select';
import { ContractSelection } from './contract.select';
import { EmployeeShortSelection } from './employee.select';
import { PartnerSelection } from './partner.select';

export const InvoiceSelection: Prisma.InvoicesSelect = {
    id: true,
    code: true,
    payment_method: true,
    time_at: true,
    status: true,
    files: true,
};

export const InvoiceSelectionAll: Prisma.InvoicesSelect = {
    ...InvoiceSelection,
    details: {
        select: CommonDetailSelectionAll,
    },
    bank: {
        select: BankSelection,
    },
    contract: {
        select: ContractSelection,
    },
    employee: {
        select: EmployeeShortSelection,
    },
    partner: {
        select: PartnerSelection,
    },
};
