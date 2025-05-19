import { Representatives, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { RepresentativeSelection, RepresentativeSelectionAll } from './prisma/representative.select';

export class RepresentativeRepo extends BaseRepo<
    Representatives,
    Prisma.RepresentativesSelect,
    Prisma.RepresentativesWhereInput
> {
    protected db = DatabaseAdapter.getInstance().representatives;
    protected defaultSelect = RepresentativeSelection;
    protected detailSelect = RepresentativeSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'representatives';
}
