import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { SearchField } from '@common/interfaces/common.interface';
import { QuotationRequestDetails, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { QuotationRequestDetailSelection, QuotationRequestDetailSelectionAll } from './prisma/prisma.select';

export class QuotationRequestDetailRepo extends BaseRepo<
    QuotationRequestDetails,
    Prisma.QuotationRequestDetailsSelect,
    Prisma.QuotationRequestDetailsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().quotationRequestDetails;
    protected defaultSelect = QuotationRequestDetailSelection;
    protected detailSelect = QuotationRequestDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'quotationRequestDetails';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['product', 'name'] }, { path: ['note'] }],
    };
}
