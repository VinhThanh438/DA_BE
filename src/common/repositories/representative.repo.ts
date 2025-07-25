import { Representatives, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { RepresentativeSelection, RepresentativeSelectionAll } from './prisma/prisma.select';

export class RepresentativeRepo extends BaseRepo<
    Representatives,
    Prisma.RepresentativesSelect,
    Prisma.RepresentativesWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().representatives;
    protected defaultSelect = RepresentativeSelection;
    protected detailSelect = RepresentativeSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'representatives';
}
