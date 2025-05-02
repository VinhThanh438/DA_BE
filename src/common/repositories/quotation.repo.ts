import { Quotations, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EmployeeShortSelection } from './employee.repo';
import { PartnerSelection } from './partner.repo';
import { CommonDetailSelectionAll } from './common-detail.repo';

export const QuotationSelection: Prisma.QuotationsSelect = {
    id: true,
    code: true,
    time_at: true,
    expired_date: true,
    note: true,
    status: true,
    type: true,
    files: true,
    is_confirmed: true,
    partner_id: true,
};

export const QuotationSelectionAll: Prisma.QuotationsSelect = {
    ...QuotationSelection,
    employee: {
        select: EmployeeShortSelection,
    },
    partner: {
        select: PartnerSelection,
    },
    quotation_details: {
        select: CommonDetailSelectionAll,
    },
};

export class QuotationRepo extends BaseRepo<Quotations, Prisma.QuotationsSelect, Prisma.QuotationsWhereInput> {
    protected db = DatabaseAdapter.getInstance().quotations;
    protected defaultSelect = QuotationSelection;
    protected detailSelect = QuotationSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'quotations';
}
