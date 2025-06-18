import { Organizations, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { OrganizationSelectionAll } from './prisma/organization.select';
import { SearchField } from '@common/interfaces/common.interface';
import { OrganizationSelection } from './prisma/base.select';

export class OrganizationRepo extends BaseRepo<
    Organizations,
    Prisma.OrganizationsSelect,
    Prisma.OrganizationsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().organizations;
    protected defaultSelect = OrganizationSelection;
    protected detailSelect = OrganizationSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'organizations';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['name'] }, { path: ['code'] }],
    };
}
