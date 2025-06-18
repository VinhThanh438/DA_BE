import { Prisma } from '.prisma/client';
import { PaymentRequestDetailSelectionAll } from './payment-request-details.select';
import { EmployeeSelection } from './employee.select';
import { PartnerSelection } from './partner.select';
import { BankSelection } from './bank.select';

export const PaymentRequestSelectBasic: Prisma.PaymentRequestsSelect = {
    id: true,
    time_at: true,
    code: true,
    payment_date: true,
    note: true,
    type: true,
    files: true,
    status: true,
    rejected_reason: true,
    partner_id: true,
};

export const PaymentRequestSelect: Prisma.PaymentRequestsSelect = {
    ...PaymentRequestSelectBasic,
    employee: {
        select: EmployeeSelection,
    },
    approver: {
        select: EmployeeSelection,
    },
    partner: {
        select: PartnerSelection,
    },
    bank: {
        select: BankSelection,
    },
};
export const PaymentRequestSelectAll: Prisma.PaymentRequestsSelect = {
    ...PaymentRequestSelect,
    details: {
        select: PaymentRequestDetailSelectionAll,
    },
};

export const PaymentRequestSelectAllWithBank: Prisma.PaymentRequestsSelect = {
    ...PaymentRequestSelectBasic,
    bank: {
        select: BankSelection,
    },
};
