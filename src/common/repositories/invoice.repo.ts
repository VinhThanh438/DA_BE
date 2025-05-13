import { Invoices, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { CommonDetailSelectionAll } from './common-detail.repo';
import { BankSelection } from './bank.repo';
import { ContractSelection } from './contract.repo';
import { EmployeeShortSelection } from './employee.repo';
import { PartnerSelection } from './partner.repo';

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
        select: CommonDetailSelectionAll
    },
    bank: {
        select: BankSelection
    },
    contract: {
        select: ContractSelection
    },
    employee: {
        select: EmployeeShortSelection
    },
    partner: {
        select: PartnerSelection
    }
};

export class InvoiceRepo extends BaseRepo<Invoices, Prisma.InvoicesSelect, Prisma.InvoicesWhereInput> {
    protected db = DatabaseAdapter.getInstance().invoices;
    protected defaultSelect = InvoiceSelection;
    protected detailSelect = InvoiceSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'invoices';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields = ['code'];
}
