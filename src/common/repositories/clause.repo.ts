import { Clauses, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';

export const ClauseSelection: Prisma.ClausesSelect = {
    id: true,
    name: true,
    content: true,
    max_dept_amount: true,
    max_dept_day: true,
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
    protected modelKey: keyof Prisma.TransactionClient = 'clauses';
}
