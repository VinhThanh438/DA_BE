import { PartnerGroupRepo } from '@common/repositories/partner-group.repo';
import { BaseService } from './base.service';
import { PartnerGroups, Prisma } from '.prisma/client';

export class PartnerGroupService extends BaseService<
    PartnerGroups,
    Prisma.PartnerGroupsSelect,
    Prisma.PartnerGroupsWhereInput
> {
    private static instance: PartnerGroupService;

    private constructor() {
        super(new PartnerGroupRepo());
    }

    public static getInstance(): PartnerGroupService {
        if (!this.instance) {
            this.instance = new PartnerGroupService();
        }
        return this.instance;
    }
}
