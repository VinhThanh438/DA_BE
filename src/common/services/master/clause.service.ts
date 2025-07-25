import { ClauseRepo } from '@common/repositories/clause.repo';
import { BaseService } from './base.service';
import { Clauses, Prisma } from '.prisma/client';

export class ClauseService extends BaseService<
    Clauses,
    Prisma.ClausesSelect,
    Prisma.ClausesWhereInput
> {
    private static instance: ClauseService;

    private constructor() {
        super(new ClauseRepo());
    }

    public static getInstance(): ClauseService {
        if (!this.instance) {
            this.instance = new ClauseService();
        }
        return this.instance;
    }
}
