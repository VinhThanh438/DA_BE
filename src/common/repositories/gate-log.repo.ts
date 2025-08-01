import { IFilterArgs, IPaginationInput, IPaginationResponse, SearchField } from '@common/interfaces/common.interface';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { GateLogs, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { GateLogSelection, GateLogSelectionAll } from './prisma/prisma.select';

export class GateLogRepo extends BaseRepo<GateLogs, Prisma.GateLogsSelect, Prisma.GateLogsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().gateLogs;
    protected defaultSelect = GateLogSelection;
    protected detailSelect = GateLogSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'gateLogs';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['name'] }],
    };

    public async paginate(
        { page, size, keyword, startAt, endAt, ...args }: Partial<IPaginationInput>,
        includeRelations?: boolean,
    ): Promise<IPaginationResponse> {
        const { plate, childrenId, ...restQuery } = args as IFilterArgs;

        const customWhere: Prisma.GateLogsWhereInput = {
            ...(plate && {
                inventory: { plate },
                entry_time: { not: null },
                exit_time: null,
            }),
        };

        const orderBy: Prisma.GateLogsOrderByWithRelationInput[] = [{ idx: 'desc' }, { inventory_id: 'desc' }];

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
            null,
            orderBy,
        );
    }
}
