import { InterestLogs, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { InterestLogSelection, InterestLogSelectionAll } from './prisma/interest-log.select';
import { IFilterArgs, IPaginationInput, IPaginationResponse, SearchField } from '@common/interfaces/common.interface';
import { LoanSelection } from './prisma/loan.select';

export class InterestLogRepo extends BaseRepo<InterestLogs, Prisma.InterestLogsSelect, Prisma.InterestLogsWhereInput> {
    protected db = DatabaseAdapter.getInstance().interestLogs;
    protected defaultSelect = InterestLogSelection;
    protected detailSelect = InterestLogSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'interestLogs';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['code'] }],
    };

    public async findFirst(
        where: Prisma.InterestLogsWhereInput = {} as Prisma.InterestLogsWhereInput,
        includeRelations: boolean = false,
        tx?: Prisma.TransactionClient,
    ): Promise<Partial<InterestLogs> | null> {
        const sanitizedWhere = this.sanitizeJsonFilters(where);
        const db = this.getModel(tx);

        return db.findFirst({
            where: sanitizedWhere,
            select: includeRelations ? this.detailSelect : this.defaultSelect,
            orderBy: {
                created_at: 'desc',
            },
        });
    }

    public async paginate(
        { page, size, keyword, startAt, endAt, ...args }: Partial<IPaginationInput>,
        includeRelations?: boolean,
    ): Promise<IPaginationResponse> {
        const { bank_id, is_paymented, ...restQuery } = args as IFilterArgs;

        const customWhere: Prisma.InterestLogsWhereInput = {
            ...(is_paymented && {
                is_paymented: is_paymented,
            }),
            ...(bank_id && {
                loan: {
                    bank_id: bank_id,
                },
            }),
        };

        const customSelect: Prisma.InterestLogsSelect = {
            loan: {
                select: LoanSelection,
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
