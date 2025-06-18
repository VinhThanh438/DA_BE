import { QuotationRequests, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { QuotationRequestSelection, QuotationRequestSelectionAll } from './prisma/quotation-request.select';
import { SearchField } from '@common/interfaces/common.interface';

export class QuotationRequestRepo extends BaseRepo<
    QuotationRequests,
    Prisma.QuotationRequestsSelect,
    Prisma.QuotationRequestsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().quotationRequests;
    protected defaultSelect = QuotationRequestSelection;
    protected detailSelect = QuotationRequestSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'quotationRequests';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['organization_name'] }, { path: ['requester_name'] }, { path: ['note'] }]
    };
}
