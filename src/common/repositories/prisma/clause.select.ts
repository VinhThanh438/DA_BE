import { Prisma } from '.prisma/client';
import { OrganizationSelection } from './base.select';

export const ClauseSelection: Prisma.ClausesSelect = {
    id: true,
    name: true,
    content: true,
    max_dept_amount: true,
    max_dept_day: true,
};
export const ClauseSelectionAll: Prisma.ClausesSelect = {
    ...ClauseSelection,
    organization: {
        select: OrganizationSelection,
    },
};
