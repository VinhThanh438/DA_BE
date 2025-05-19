import { Invoices, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { InvoiceSelection, InvoiceSelectionAll } from './prisma/invoice.select';

export class InvoiceRepo extends BaseRepo<Invoices, Prisma.InvoicesSelect, Prisma.InvoicesWhereInput> {
    protected db = DatabaseAdapter.getInstance().invoices;
    protected defaultSelect = InvoiceSelection;
    protected detailSelect = InvoiceSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'invoices';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields = ['code'];
}
