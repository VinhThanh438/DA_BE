import { Prisma } from '.prisma/client';

export const QuotationRequestSelection: Prisma.QuotationRequestsSelect = {
    id: true,
    requester_name: true,
    organization_name: true,
    receiver_name: true,
    tax: true,
    email: true,
    address: true,
    note: true,
    status: true,
    phone: true,
    files: true,
    type: true,
};

export const QuotationRequestSelectionAll: Prisma.QuotationRequestsSelect = {
    ...QuotationRequestSelection,
};
