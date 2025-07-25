import { IFilterArgs, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { PurchaseRequests, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import {
    PurchaseRequestSelection,
    PurchaseRequestSelectionAll,
    PurchaseRequestDetailSelectionAll,
} from './prisma/prisma.select';

export class PurchaseRequestRepo extends BaseRepo<
    PurchaseRequests,
    Prisma.PurchaseRequestsSelect,
    Prisma.PurchaseRequestsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().purchaseRequests;
    protected defaultSelect = PurchaseRequestSelection;
    protected detailSelect = PurchaseRequestSelectionAll;
    protected timeFieldDefault: string = 'time_at';
    protected modelKey: keyof Prisma.TransactionClient = 'purchaseRequests';

    public async paginate(
        { page, size, keyword, startAt, endAt, ...args }: Partial<IPaginationInput>,
        includeRelations?: boolean,
    ): Promise<IPaginationResponse> {
        const { productIds, employeeIds, ...restQuery } = args as IFilterArgs;

        const customWhere: Prisma.PurchaseRequestsWhereInput = {
            ...(productIds?.length && {
                details: { some: { material_id: { in: productIds } } },
            }),
            ...(employeeIds?.length && {
                employee_id: { in: employeeIds },
            }),
        };

        const customSelect: Prisma.PurchaseRequestsSelect = {
            details: {
                where: { ...(productIds?.length && { material_id: { in: productIds } }) },
                select: PurchaseRequestDetailSelectionAll,
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
