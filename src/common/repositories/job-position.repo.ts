import { JobPositions, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { PositionSelection } from './position.repo';
import { OrganizationSelection } from './organization.repo';

export const JobPositionSelection: Prisma.JobPositionsSelect = {
    id: true,
    name: true,
    level: true,
    description: true,
};

export const JobPositionSelectionAll: Prisma.JobPositionsSelect = {
    ...JobPositionSelection,
    position: {
        select: PositionSelection,
    },
    organization: {
        select: OrganizationSelection
    }
};

export class JobPositionRepo extends BaseRepo<JobPositions, Prisma.JobPositionsSelect, Prisma.JobPositionsWhereInput> {
    protected db = DatabaseAdapter.getInstance().jobPositions;
    protected defaultSelect = JobPositionSelection;
    protected detailSelect = JobPositionSelectionAll;
}
