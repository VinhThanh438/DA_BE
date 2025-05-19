import { Prisma } from '.prisma/client';
import { CommonDetailSelectionAll } from './common-detail.select';
import { EmployeeShortSelection } from './employee.select';
import { PartnerSelection } from './partner.select';
import { PurchaseRequestSelection } from './purchase-request.select';

export const QuotationSelection: Prisma.QuotationsSelect = {
    id: true,
    code: true,
    time_at: true,
    expired_date: true,
    note: true,
    status: true,
    type: true,
    files: true,
    quotation_files: true,
    message: true,
    is_confirmed: true,
    partner_id: true,
    purchase_request_id: true,
    rejected_reason: true,
};

export const QuotationSelectionAll: Prisma.QuotationsSelect = {
    ...QuotationSelection,
    employee: {
        select: EmployeeShortSelection,
    },
    partner: {
        select: PartnerSelection,
    },
    purchase_request: {
        select: PurchaseRequestSelection,
    },
    details: {
        select: CommonDetailSelectionAll,
    },
};
