import { Prisma } from '.prisma/client';
import { OrganizationSelection } from './organization.select';

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
    type: true,
};

export const FinanceRecordSelectionAll: Prisma.FinanceRecordsSelect = {
    ...FinanceRecordSelection,
    organization: {
        select: OrganizationSelection,
    },
};
