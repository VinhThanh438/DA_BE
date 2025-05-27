import { Prisma } from '.prisma/client';
import { CommonDetailSelectionAll } from './common-detail.select';

export const InvoiceDetailSelection: Prisma.InvoiceDetailsSelect = {
    id: true,
    order_detail_id: true,
    note: true,
};

export const InvoiceDetailSelectionAll: Prisma.InvoiceDetailsSelect = {
    ...InvoiceDetailSelection,
    order_detail: {
        select: CommonDetailSelectionAll,
    },
};
