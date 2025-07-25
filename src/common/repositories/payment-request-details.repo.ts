import { Prisma, PaymentRequestDetails } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { PaymentRequestDetailSelection, PaymentRequestDetailSelectionAll } from './prisma/prisma.select';

export class PaymentRequestDetailRepo extends BaseRepo<
    PaymentRequestDetails,
    Prisma.PaymentRequestDetailsSelect,
    Prisma.PaymentRequestDetailsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().paymentRequestDetails;
    protected defaultSelect = PaymentRequestDetailSelection;
    protected detailSelect = PaymentRequestDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'paymentRequestDetails';
}
