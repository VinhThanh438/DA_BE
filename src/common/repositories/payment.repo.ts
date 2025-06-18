import { Prisma, Payments } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { PaymentSelect, PaymentSelectAll } from './prisma/payment.select';
import { SearchField } from '@common/interfaces/common.interface';

export class PaymentRepo extends BaseRepo<Payments, Prisma.PaymentsSelect, Prisma.PaymentsWhereInput> {
    protected db = DatabaseAdapter.getInstance().payments;
    protected defaultSelect = PaymentSelect;
    protected detailSelect = PaymentSelectAll;
    protected modelKey: keyof Prisma.TransactionClient = 'payments';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['code'] },]
    };
}
