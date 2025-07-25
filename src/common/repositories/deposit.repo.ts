import { Deposits, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import {
    IFilterArgs,
    IPaginationInfo,
    IPaginationInput,
    IPaginationResponse,
} from '@common/interfaces/common.interface';
import { IDepositPaginationInput } from '@common/interfaces/deposit.interface';
import { DepositSelection, DepositSelectionAll } from './prisma/prisma.select';

export class DepositRepo extends BaseRepo<Deposits, Prisma.DepositsSelect, Prisma.DepositsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().deposits;
    protected defaultSelect = DepositSelection;
    protected detailSelect = DepositSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'deposits';
    protected timeFieldDefault: string = 'deposit_date';

    public async paginateDeposit(query: IDepositPaginationInput): Promise<IPaginationResponse> {
        const data = await this.db.findMany({
            where: {},
            select: DepositSelection,
            skip: (query.page - 1) * query.size,
            take: query.size,
            orderBy: { id: 'desc' },
        });

        return {
            data: data,
            pagination: {
                totalPages: 1,
                totalRecords: 1,
                size: query.size,
                page: query.page,
            } as unknown as IPaginationInfo,
        };
    }

    public async paginate(
        { page, size, keyword, startAt, endAt, organizationId, ...args }: Partial<IPaginationInput>,
        includeRelations?: boolean,
    ): Promise<IPaginationResponse> {
        const { bank, ...restQuery } = args as IFilterArgs;

        const customWhere: Prisma.BanksWhereInput = {
            ...(bank && {
                bank: { bank: bank },
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
