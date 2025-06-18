import { Prisma } from '.prisma/client';
import { LoanSelection } from './loan.select';

export const InterestLogSelection: Prisma.InterestLogsSelect = {
    id: true,
    debt_before_payment: true,
    time_at: true,
    amount: true,
    interest_amount: true,
    interest_days: true,
    interest_rate: true,
    is_paymented: true,
};

export const InterestLogSelectionAll: Prisma.InterestLogsSelect = {
    ...InterestLogSelection,
    loan: {
        select: LoanSelection,
    },
};
