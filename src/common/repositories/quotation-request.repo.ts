import { QuotationRequests, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { IFilterArgs, IPaginationInput, IPaginationResponse, SearchField } from '@common/interfaces/common.interface';
import { QuotationRequestSelection, QuotationRequestSelectionAll } from './prisma/prisma.select';

export class QuotationRequestRepo extends BaseRepo<
    QuotationRequests,
    Prisma.QuotationRequestsSelect,
    Prisma.QuotationRequestsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().quotationRequests;
    protected defaultSelect = QuotationRequestSelection;
    protected detailSelect = QuotationRequestSelectionAll;
    protected timeFieldDefault: string = 'time_at';
    protected modelKey: keyof Prisma.TransactionClient = 'quotationRequests';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['code'] }],
    };

    public async paginate(
        { page, size, keyword, startAt, endAt, ...args }: Partial<IPaginationInput>,
        includeRelations?: boolean,
    ): Promise<IPaginationResponse> {
        const { productIds, supplierIds, employeeIds, status, ...restQuery } = args as IFilterArgs;

        const customWhere: Prisma.QuotationRequestsWhereInput = {
            ...(status && { status: status as any }),
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
