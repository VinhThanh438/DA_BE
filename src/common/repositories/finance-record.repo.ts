import { FinanceRecords, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { OrganizationSelection } from './organization.repo';

export const FinanceRecordSelection: Prisma.FinanceRecordsSelect = {
    id: true,
    code: true,
    time_at: true,
    description: true,
    payment_method: true,
    amount: true,
    counterparty_name: true,
    counterparty_address: true,
    attached_documents: true,
    files: true,
    type: true
};

export const FinanceRecordSelectionAll: Prisma.FinanceRecordsSelect = {
    ...FinanceRecordSelection,
    organization: {
        select: OrganizationSelection
    }
};

export class FinanceRecordRepo extends BaseRepo<FinanceRecords, Prisma.FinanceRecordsSelect, Prisma.FinanceRecordsWhereInput> {
    protected db = DatabaseAdapter.getInstance().financeRecords;
    protected defaultSelect = FinanceRecordSelection;
    protected detailSelect = FinanceRecordSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'financeRecords';
}
