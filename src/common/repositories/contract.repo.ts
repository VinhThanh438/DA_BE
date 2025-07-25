import { Contracts, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { IFilterArgs, IPaginationInput, IPaginationResponse, SearchField } from '@common/interfaces/common.interface';
import { ContractSelection, ContractSelectionAll, CommonDetailSelectionAll } from './prisma/prisma.select';

export class ContractRepo extends BaseRepo<Contracts, Prisma.ContractsSelect, Prisma.ContractsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().contracts;
    protected defaultSelect = ContractSelection;
    protected detailSelect = ContractSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'contracts';
    protected timeFieldDefault: string = 'contract_date';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['code'] }],
    };

    public async paginate(
        { page, size, keyword, startAt, endAt, ...args }: Partial<IPaginationInput>,
        includeRelations?: boolean,
    ): Promise<IPaginationResponse> {
        const { productIds, supplierIds, employeeIds, ...restQuery } = args as IFilterArgs;

        const customWhere: Prisma.ContractsWhereInput = {
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

        const customSelect: Prisma.ContractsSelect = {
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
