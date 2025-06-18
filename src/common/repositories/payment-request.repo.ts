import { Prisma, PaymentRequests } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { PaymentRequestSelectAll } from './prisma/payment-request.select';
import { SearchField } from '@common/interfaces/common.interface';

export class PaymentRequestRepo extends BaseRepo<
    PaymentRequests,
    Prisma.PaymentRequestsSelect,
    Prisma.PaymentRequestsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().paymentRequests;
    protected defaultSelect = PaymentRequestSelectAll;
    protected detailSelect = PaymentRequestSelectAll;
    protected modelKey: keyof Prisma.TransactionClient = 'paymentRequests';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [
            { path: ['code'] },
            { path: ['partner', 'name'] },
            { path: ['details', 'invoice', 'code'], isArray: true },
        ]
    };
}
