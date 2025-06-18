import { Invoices, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { InvoiceSelectionAll, InvoiceSelectionWithTotal } from './prisma/invoice.select';
import { IFilterArgs, IPaginationInput, IPaginationResponse, SearchField } from '@common/interfaces/common.interface';
import { InvoiceDetailSelectionAll } from './prisma/invoice-detail.select';

export class InvoiceRepo extends BaseRepo<Invoices, Prisma.InvoicesSelect, Prisma.InvoicesWhereInput> {
    protected db = DatabaseAdapter.getInstance().invoices;
    protected defaultSelect = InvoiceSelectionWithTotal;
    protected detailSelect = InvoiceSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'invoices';
    protected timeFieldDefault: string = 'invoice_date';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['code'] }, { path: ['order', 'code'] }],
    };

    public async paginate(
        { page, size, keyword, startAt, endAt, ...args }: Partial<IPaginationInput>,
        includeRelations?: boolean,
    ): Promise<IPaginationResponse> {
        const { productIds, supplierIds, employeeIds, ...restQuery } = args as IFilterArgs;

        const customWhere: Prisma.InvoicesWhereInput = {
            ...(productIds?.length && {
                details: { some: { order_detail: { product_id: { in: productIds } } } },
            }),
            ...(supplierIds?.length && {
                partner_id: { in: supplierIds },
            }),
            ...(employeeIds?.length && {
                employee_id: { in: employeeIds },
            }),
        };

        const customSelect: Prisma.InvoicesSelect = {
            details: {
                where: { ...(productIds?.length && { order_detail: { product_id: { in: productIds } } }) },
                select: InvoiceDetailSelectionAll,
            },
        };

        return super.paginate(
            {
                page,
                size,
                keyword,
                startAt,
                endAt,
                ...restQuery,
            },
            includeRelations,
            customWhere,
            customSelect,
        );
    }
}
