import { Insurances, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { InsuranceSelection, InsuranceSelectionAll } from './prisma/insurance.select';

export class InsuranceRepo extends BaseRepo<Insurances, Prisma.InsurancesSelect, Prisma.InsurancesWhereInput> {
    protected db = DatabaseAdapter.getInstance().insurances;
    protected defaultSelect = InsuranceSelection;
    protected detailSelect = InsuranceSelectionAll;
    protected modelKey = 'insurances' as const;
}
