import { PartnerGroups, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';

export const PartnerGroupSelection: Prisma.PartnerGroupsSelect = {
    id: true,
    name: true,
}

export const PartnerGroupSelectionAll: Prisma.PartnerGroupsSelect = {
    ...PartnerGroupSelection
};

export class PartnerGroupRepo extends BaseRepo<PartnerGroups, Prisma.PartnerGroupsSelect, Prisma.PartnerGroupsWhereInput> {
    protected db = DatabaseAdapter.getInstance().partnerGroups;
    protected defaultSelect = PartnerGroupSelection;
    protected detailSelect = PartnerGroupSelectionAll;
}
