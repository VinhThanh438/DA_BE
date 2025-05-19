import { Prisma } from '.prisma/client';
import { CommonDetailSelectionAll } from './common-detail.select';

export const PaymentRequestDetailSelection: Prisma.PaymentRequestDetailsSelect = {
    id: true,
    order_detail_id: true,
    amount: true,
    note: true,
};
export const PaymentRequestDetailSelectionAll: Prisma.PaymentRequestDetailsSelect = {
    ...PaymentRequestDetailSelection,
    order_detail: {
        select: CommonDetailSelectionAll,
    },
};
