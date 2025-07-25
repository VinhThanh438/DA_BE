import { Quotations, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { IFilterArgs, IPaginationInput, IPaginationResponse, SearchField } from '@common/interfaces/common.interface';
import { QuotationSelection, QuotationSelectionAll } from './prisma/prisma.select';

export class QuotationRepo extends BaseRepo<Quotations, Prisma.QuotationsSelect, Prisma.QuotationsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().quotations;
    protected defaultSelect = QuotationSelection;
    protected detailSelect = QuotationSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'quotations';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['code'] }, { path: ['message'] }, { path: ['organization_name'] }],
    };

    public async paginate(
        { page, size, keyword, startAt, endAt, ...args }: Partial<IPaginationInput>,
        includeRelations?: boolean,
    ): Promise<IPaginationResponse> {
        const { productIds, supplierIds, employeeIds, ...restQuery } = args as IFilterArgs;

        const customWhere: Prisma.QuotationsWhereInput = {
            ...(supplierIds?.length && {
                partner_id: { in: supplierIds },
            }),
            ...(employeeIds?.length && {
                employee_id: { in: employeeIds },
            }),
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
        );
    }
}
