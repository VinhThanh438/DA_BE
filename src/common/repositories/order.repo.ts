import { Orders, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { OrderSelectionAll } from './prisma/order.select';
import { IFilterArgs, IPaginationInput, IPaginationResponse, SearchField } from '@common/interfaces/common.interface';
import { CommonDetailSelectionAll } from './prisma/common-detail.select';
import { OrderSelection } from './prisma/base.select';

export class OrderRepo extends BaseRepo<Orders, Prisma.OrdersSelect, Prisma.OrdersWhereInput> {
    protected db = DatabaseAdapter.getInstance().orders;
    protected defaultSelect = OrderSelection;
    protected detailSelect = OrderSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'orders';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['code'] }, { path: ['address'] }, { path: ['note'] }],
    };

    public async paginate(
        { page, size, keyword, startAt, endAt, ...args }: Partial<IPaginationInput>,
        includeRelations?: boolean,
    ): Promise<IPaginationResponse> {
        const { productIds, employeeIds, supplierIds, ...restQuery } = args as IFilterArgs;

        const customWhere: Prisma.OrdersWhereInput = {
            ...(productIds?.length && {
                details: { some: { product_id: { in: productIds } } },
            }),
            ...(supplierIds?.length && {
                partner_id: { in: supplierIds },
            }),
            ...(employeeIds?.length && {
                employee_id: { in: employeeIds },
            }),
        };

        const customSelect: Prisma.OrdersSelect = {
            details: {
                where: { ...(productIds?.length && { product_id: { in: productIds } }) },
                select: CommonDetailSelectionAll,
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
