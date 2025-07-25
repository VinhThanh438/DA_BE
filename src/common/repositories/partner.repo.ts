import { IFilterArgs, IPaginationInput, IPaginationResponse, SearchField } from '@common/interfaces/common.interface';
import { PartnerSelection, PartnerSelectionAll } from './prisma/prisma.select';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { Partners, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';

export class PartnerRepo extends BaseRepo<Partners, Prisma.PartnersSelect, Prisma.PartnersWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().partners;
    protected defaultSelect = PartnerSelection;
    protected detailSelect = PartnerSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'partners';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['name'] }, { path: ['code'] }, { path: ['email'] }, { path: ['tax'] }],
    };

    async paginate(
        { page, size, keyword, startAt, endAt, ...args }: Partial<IPaginationInput>,
        includeRelations?: boolean,
    ): Promise<IPaginationResponse> {
        const { types, ...restQuery } = args as IFilterArgs;

        const customWhere: Prisma.PartnersWhereInput = {
            ...(types?.length && {
                type: { in: types },
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
