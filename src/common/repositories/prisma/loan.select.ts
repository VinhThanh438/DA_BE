import { Prisma } from '.prisma/client';
import { PartnerSelection } from './partner.select';
import { InterestLogSelection } from './interest-log.select';
import { InvoiceSelection, OrderSelection } from './base.select';
import { BankSelection } from './bank.select';

export const LoanSelection: Prisma.LoansSelect = {
    id: true,
    account_number: true,
    disbursement_date: true,
    interest_calculation_date: true,
    payment_day: true,
    term: true,
    amount: true,
    interest_rate: true,
    current_debt: true,
    // bank: true,
    files: true,
    note: true,
    status: true,
    rejected_reason: true,
    organization_id: true,
    bank_id: true,
    invoice_id: true,
    order_id: true,
    partner_id: true,
};

export const LoanSelectionWithInterestLog: Prisma.LoansSelect = {
    ...LoanSelection,
    bank: {
        select: BankSelection,
    },
    interest_logs: {
        select: InterestLogSelection,
    },
};

export const LoanSelectionAll: Prisma.LoansSelect = {
    ...LoanSelectionWithInterestLog,
    invoice: {
        select: InvoiceSelection,
    },
    order: {
        select: OrderSelection,
    },
    partner: {
        select: PartnerSelection,
    },
    bank: {
        select: BankSelection,
    },
};
