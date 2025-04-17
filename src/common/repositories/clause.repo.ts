import { Clauses, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { IPaginationInputClause } from '@common/interfaces/clause.interface';
import { IPaginationResponse } from '@common/interfaces/common.interface';

export const ClauseSelection: Prisma.ClausesSelect = {
    name: true,
    content: true,
};
export const ClauseSelectionAll: Prisma.ClausesSelect = {
    ...ClauseSelection,
};

export class ClauseRepo extends BaseRepo<Clauses, Prisma.ClausesSelect, Prisma.ClausesWhereInput> {
    constructor() {
        super();
    }
    protected db = DatabaseAdapter.getInstance().clauses;
    protected defaultSelect = ClauseSelection;
    protected detailSelect = ClauseSelectionAll;

    public async getAll(
        body: IPaginationInputClause,
        includeRelations: boolean,
        organization_id: number | null,
    ): Promise<IPaginationResponse> {
        const s_query = organization_id
            ? {
                  organization_id: organization_id,
              }
            : {};

        return super.paginate(body, includeRelations, s_query);
    }
}
