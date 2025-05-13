import { Representatives, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { orderSelectionDetails } from './order.repo';

export const RepresentativeSelection: Prisma.RepresentativesSelect = {
    id: true,
    name: true,
    phone: true,
    salutation: true,
    title: true,
    email: true
};

export const RepresentativeSelectionAll: Prisma.RepresentativesSelect = {
    ...RepresentativeSelection,
    orders: {
        select: orderSelectionDetails
    }
};

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
