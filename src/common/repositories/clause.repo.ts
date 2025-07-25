import { Clauses, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { SearchField } from '@common/interfaces/common.interface';
import { ClauseSelection, ClauseSelectionAll } from './prisma/prisma.select';

export class ClauseRepo extends BaseRepo<Clauses, Prisma.ClausesSelect, Prisma.ClausesWhereInput> {
    constructor() {
        super();
    }
    protected db = DatabaseAdapter.getInstance().getClient().clauses;
    protected defaultSelect = ClauseSelection;
    protected detailSelect = ClauseSelectionAll;
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['name'] }],
    };
    protected modelKey: keyof Prisma.TransactionClient = 'clauses';
}
