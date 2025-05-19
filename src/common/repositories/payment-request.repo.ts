import { Prisma, PaymentRequests } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { PaymentRequestSelect, PaymentRequestSelectAll } from './prisma/payment-request.select';

export class PaymentRequestRepo extends BaseRepo<
    PaymentRequests,
    Prisma.PaymentRequestsSelect,
    Prisma.PaymentRequestsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().paymentRequests;
    protected defaultSelect = PaymentRequestSelect;
    protected detailSelect = PaymentRequestSelectAll;
    protected modelKey: keyof Prisma.TransactionClient = 'paymentRequests';
    protected searchableFields = ['code'];
}
