import { Prisma, Payments } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { SearchField } from '@common/interfaces/common.interface';
import { PaymentSelect, PaymentSelectAll } from './prisma/prisma.select';

export class PaymentRepo extends BaseRepo<Payments, Prisma.PaymentsSelect, Prisma.PaymentsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().payments;
    protected defaultSelect = PaymentSelect;
    protected detailSelect = PaymentSelectAll;
    protected modelKey: keyof Prisma.TransactionClient = 'payments';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['code'] }],
    };
}
