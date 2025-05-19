import { PartnerGroups, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { PartnerGroupSelection, PartnerGroupSelectionAll } from './prisma/partner-group.select';

export class PartnerGroupRepo extends BaseRepo<
    PartnerGroups,
    Prisma.PartnerGroupsSelect,
    Prisma.PartnerGroupsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().partnerGroups;
    protected defaultSelect = PartnerGroupSelection;
    protected detailSelect = PartnerGroupSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'partnerGroups';
}
