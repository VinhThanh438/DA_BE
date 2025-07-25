import { InvoiceDetails, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { InvoiceDetailSelection, InvoiceDetailSelectionAll } from './prisma/prisma.select';

export class InvoiceDetailRepo extends BaseRepo<
    InvoiceDetails,
    Prisma.InvoiceDetailsSelect,
    Prisma.InvoiceDetailsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().invoiceDetails;
    protected defaultSelect = InvoiceDetailSelection;
    protected detailSelect = InvoiceDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'invoiceDetails';
}
