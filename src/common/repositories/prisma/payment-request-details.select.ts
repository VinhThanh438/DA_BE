import { Prisma } from '.prisma/client';
import {
    PaymentRequestSelect,
    PaymentRequestSelectAllWithBank,
    PaymentRequestSelectBasic,
} from './payment-request.select';
import { LoanSelectionWithInterestLog } from './loan.select';
import { InterestLogSelection } from './interest-log.select';
import { InvoiceSelection, OrderSelection } from './base.select';
import { OrderSelectionDetails } from './order.select';
import { BankSelectionAll } from './bank.select';
import { PartnerSelection } from './partner.select';
import { RepresentativeSelectionAll } from './representative.select';

export const PaymentRequestDetailSelection: Prisma.PaymentRequestDetailsSelect = {
    id: true,
    code: true,
    amount: true,
    note: true,
    status: true,
    order_id: true,
    invoice_id: true,
    payment_request_id: true,
    loan_id: true,
    interest_log_id: true,
};
export const PaymentRequestDetailSelectionAll: Prisma.PaymentRequestDetailsSelect = {
    ...PaymentRequestDetailSelection,
    order: {
        select: OrderSelectionDetails,
    },
    invoice: {
        select: InvoiceSelection,
    },
    payment_request: {
        select: {
            ...PaymentRequestSelectBasic,
            bank: {
                select: BankSelectionAll,
            },
            partner: {
                select: PartnerSelection,
            },
            representative: {
                select: RepresentativeSelectionAll,
            },
        },
    },
    loan: {
        select: LoanSelectionWithInterestLog,
    },
    interest_log: {
        select: InterestLogSelection,
    },
};

export const PaymentRequestDetailWithFather: Prisma.PaymentRequestDetailsSelect = {
    ...PaymentRequestDetailSelection,
    payment_request: {
        select: PaymentRequestSelect,
    },
    order: {
        select: OrderSelection,
    },
};
