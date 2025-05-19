import { Insurances, Prisma } from '.prisma/client';

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
