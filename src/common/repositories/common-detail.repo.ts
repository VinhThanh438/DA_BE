import { CommonDetails, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { ProductSelectionAll } from './product.repo';
import { UnitSelectionAll } from './unit.repo';

export const CommonDetailSelection: Prisma.CommonDetailsSelect = {
    id: true,
    quantity: true,
    price: true,
    discount: true,
    vat: true,
    note: true,
    commission: true,
};

export const CommonDetailSelectionAll: Prisma.CommonDetailsSelect = {
    ...CommonDetailSelection,
    product: {
        select: ProductSelectionAll
    },
    unit: {
        select: UnitSelectionAll
    }
};

export class CommonDetailRepo extends BaseRepo<
    CommonDetails,
    Prisma.CommonDetailsSelect,
    Prisma.CommonDetailsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().commonDetails;
    protected defaultSelect = CommonDetailSelection;
    protected detailSelect = CommonDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'commonDetails';
}
