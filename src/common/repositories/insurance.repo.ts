import { Insurances, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';

export const InsuranceSelection: Prisma.InsurancesSelect = {
    id: true,
    is_participating: true,
    rate: true,
    insurance_number: true,
    insurance_salary: true,
    start_date: true,
};

export const InsuranceSelectionAll: Prisma.InsurancesSelect = {
    ...InsuranceSelection,
};

export class InsuranceRepo extends BaseRepo<Insurances, Prisma.InsurancesSelect, Prisma.InsurancesWhereInput> {
    protected db = DatabaseAdapter.getInstance().insurances;
    protected defaultSelect = InsuranceSelection;
    protected detailSelect = InsuranceSelectionAll;
    protected modelKey = 'insurances' as const;
}
