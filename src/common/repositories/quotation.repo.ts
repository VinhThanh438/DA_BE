import { Quotations, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { QuotationSelection, QuotationSelectionAll } from './prisma/quotation.select';

export class QuotationRepo extends BaseRepo<Quotations, Prisma.QuotationsSelect, Prisma.QuotationsWhereInput> {
    protected db = DatabaseAdapter.getInstance().quotations;
    protected defaultSelect = QuotationSelection;
    protected detailSelect = QuotationSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'quotations';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields = ['code'];
}
