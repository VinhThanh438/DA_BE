import { Prisma, Payments } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { PaymentSelect, PaymentSelectAll } from './prisma/payment.select';

export class PaymentRepo extends BaseRepo<
    Payments,
    Prisma.PaymentsSelect,
    Prisma.PaymentsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().payments;
    protected defaultSelect = PaymentSelect;
    protected detailSelect = PaymentSelectAll;
    protected modelKey: keyof Prisma.TransactionClient = 'payments';
    protected searchableFields = ['code'];
}