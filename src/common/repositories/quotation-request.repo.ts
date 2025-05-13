import { QuotationRequests, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';

export const QuotationRequestSelection: Prisma.QuotationRequestsSelect = {
    id: true,
    requester_name: true,
    organization_name: true,
    receiver_name: true,
    tax: true,
    email: true,
    address: true,
    note: true,
    status: true,
    phone: true,
    files: true,
    type: true,
};

export const QuotationRequestSelectionAll: Prisma.QuotationRequestsSelect = {
    ...QuotationRequestSelection
};

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
