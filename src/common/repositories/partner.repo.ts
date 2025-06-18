import { Partners, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { PartnerSelection, PartnerSelectionAll } from './prisma/partner.select';
import { SearchField } from '@common/interfaces/common.interface';

export class PartnerRepo extends BaseRepo<Partners, Prisma.PartnersSelect, Prisma.PartnersWhereInput> {
    protected db = DatabaseAdapter.getInstance().partners;
    protected defaultSelect = PartnerSelection;
    protected detailSelect = PartnerSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'partners';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['name'] }, { path: ['code'] }, { path: ['email'] }, { path: ['tax'] }]
    };
}
