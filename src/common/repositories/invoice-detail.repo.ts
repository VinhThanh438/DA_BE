import { InvoiceDetails, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { InvoiceDetailSelection, InvoiceDetailSelectionAll } from './prisma/invoice-detail.select';

export class InvoiceDetailRepo extends BaseRepo<
    InvoiceDetails,
    Prisma.InvoiceDetailsSelect,
    Prisma.InvoiceDetailsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().invoiceDetails;
    protected defaultSelect = InvoiceDetailSelection;
    protected detailSelect = InvoiceDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'invoiceDetails';
}
