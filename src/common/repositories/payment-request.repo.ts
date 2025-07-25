import { Prisma, PaymentRequests } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { SearchField } from '@common/interfaces/common.interface';
import { PaymentRequestSelectAll } from './prisma/prisma.select';

export class PaymentRequestRepo extends BaseRepo<
    PaymentRequests,
    Prisma.PaymentRequestsSelect,
    Prisma.PaymentRequestsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().paymentRequests;
    protected defaultSelect = PaymentRequestSelectAll;
    protected detailSelect = PaymentRequestSelectAll;
    protected modelKey: keyof Prisma.TransactionClient = 'paymentRequests';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [
            { path: ['code'] },
            { path: ['partner', 'name'] },
            { path: ['details', 'invoice', 'code'], isArray: true },
        ],
    };
}
