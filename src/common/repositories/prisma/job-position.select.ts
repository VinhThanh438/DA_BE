import { Prisma } from '.prisma/client';
import { PositionSelection } from './position.select';
import { OrganizationSelection } from './base.select';

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
        select: OrganizationSelection,
    },
};
