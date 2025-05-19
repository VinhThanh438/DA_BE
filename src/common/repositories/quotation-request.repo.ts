import { QuotationRequests, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { QuotationRequestSelection, QuotationRequestSelectionAll } from './prisma/quotation-request.select';

export class QuotationRequestRepo extends BaseRepo<
    QuotationRequests,
    Prisma.QuotationRequestsSelect,
    Prisma.QuotationRequestsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().quotationRequests;
    protected defaultSelect = QuotationRequestSelection;
    protected detailSelect = QuotationRequestSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'quotationRequests';
    protected searchableFields = ['organization_name', 'requester_name', 'note'];
}
