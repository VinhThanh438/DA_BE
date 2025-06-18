import { JobPositions, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { JobPositionSelection, JobPositionSelectionAll } from './prisma/job-position.select';
import { SearchField } from '@common/interfaces/common.interface';

export class JobPositionRepo extends BaseRepo<JobPositions, Prisma.JobPositionsSelect, Prisma.JobPositionsWhereInput> {
    protected db = DatabaseAdapter.getInstance().jobPositions;
    protected defaultSelect = JobPositionSelection;
    protected detailSelect = JobPositionSelectionAll;
    protected modelKey = 'jobPositions' as const;
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['name'] }, { path: ['level'] }, { path: ['description'] }]
    };
}
